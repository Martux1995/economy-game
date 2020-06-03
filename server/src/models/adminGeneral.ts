import pgQuery from '../middleware/pgPromise';
import rndString from 'randomstring';
import bcrypt from 'bcryptjs';
import { StudentData, PersonaSinUsuario, Persona } from '../interfaces/admin';

export default class AdminGeneralModel {

    static getPersonDataByRut (rut:string) : Promise<Persona> {
        return pgQuery.one('SELECT * FROM persona WHERE rut = $1',rut);
    }

    static getPersonDataById (id:number) : Promise<Persona> {
        return pgQuery.one('SELECT * FROM persona WHERE id_persona = $1',id);
    }

    static getPersonDataByEmail (email:string) : Promise<Persona> {
        return pgQuery.one('SELECT * FROM persona WHERE correo_ucn = $1',email);
    }

    static addNewStudents (stdData:StudentData | StudentData[]) : Promise<boolean>{
        return pgQuery.tx( async t => {
            if (stdData instanceof Array) {
                for (const st of stdData) {
                    let id = await t.one('\
                        INSERT INTO persona (rut,nombre,apellido_p,apellido_m,correo) \
                        VALUES ($1,$2,$3,$4,$5) RETURNING id_persona',
                        [st.rut,st.nombres,st.apellidoP,st.apellidoM,st.correo]
                    );

                    await t.one('\
                        INSERT INTO alumno (id_alumno,id_carrera) VALUES ($1,$2) RETURNING id_alumno',
                        [id,1]
                    );
                }
            } else {
                let id = await t.one('\
                    INSERT INTO persona (rut,nombre,apellido_p,apellido_m,correo) \
                    VALUES ($1,$2,$3,$4,$5) RETURNING id_persona',
                    [stdData.rut,stdData.nombres,stdData.apellidoP,stdData.apellidoM,stdData.correo]
                );

                await t.one('\
                    INSERT INTO alumno (id_alumno,id_carrera) VALUES ($1,$2) RETURNING id_alumno',
                    [id,1]
                );
            }
            return true;
        });
    }

    static createUsers() : Promise<{teachers: PersonaSinUsuario[], players: PersonaSinUsuario[]}>{
        return pgQuery.tx(async t => {
            const data = await t.any<PersonaSinUsuario>("\
                SELECT p.id_persona, p.rut, p.nombre, p.apellido_p, p.apellido_m, \
                    p.correo_ucn, g.nombre_grupo, \
                    CASE \
                        WHEN al.id_alumno IS NOT NULL THEN 'JUGADOR' \
                        WHEN pr.id_profesor IS NOT NULL THEN 'PROFESOR' \
                        ELSE 'ADMINISTRADOR' \
                    END AS rol \
                FROM persona p \
                    LEFT OUTER JOIN profesor pr ON p.id_persona = pr.id_profesor \
                    LEFT OUTER JOIN alumno al ON p.id_persona = al.id_alumno \
                    LEFT OUTER JOIN usuario u ON p.id_persona = u.id_persona \
                    LEFT OUTER JOIN jugador ju ON al.id_alumno = ju.id_alumno \
                    LEFT OUTER JOIN grupo g ON g.id_grupo = ju.id_grupo \
                    LEFT OUTER JOIN juego j ON  g.id_juego = j.id_juego \
                WHERE (  \
                        (al.vigente IS NOT NULL AND al.vigente = TRUE)   \
                        OR (pr.vigente IS NOT NULL AND pr.vigente = TRUE)  \
                    ) \
                    AND (j.concluido IS NULL OR j.concluido = FALSE) \
                    AND (ju.vigente IS NULL OR ju.vigente = TRUE)  \
                    AND u.id_usuario IS NULL"
            );
            const successTeachers:PersonaSinUsuario[] = [];
            const successPlayers:PersonaSinUsuario[] = [];
            for (const p of data) {
                p.claveGenerada = rndString.generate({length: 10, charset: '23456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.-_@:;'});
                let hash = bcrypt.hashSync(p.claveGenerada,12);

                let i = await t.one('\
                    INSERT INTO usuario (pass_hash,id_persona,id_rol) VALUES ($1,$2,$3) RETURNING id_usuario',
                    [hash,p.idPersona,(p.rol=="ADMINISTRADOR" ? 1 : (p.rol=="JUGADOR" ? 3 : 2) )]
                );
                p.idUsuario = i.idUsuario;
                if (p.rol=='JUGADOR')   successPlayers.push(p);
                else                    successTeachers.push(p);
            }

            return {players: successPlayers, teachers: successTeachers};
        });
    }

    static setEmailStatus (mail:string|string[]) {
        if (mail instanceof Array)
            return pgQuery.one('UPDATE persona SET user_created = TRUE WHERE correo_ucn IN ($1:list)',mail);
        else
            return pgQuery.one('UPDATE persona SET user_created = TRUE WHERE correo_ucn = $1',mail);

    }

    static getAllUsers () {
        return pgQuery.any("SELECT CONCAT(p.nombre, ' ', p.apellido_p, ' ', p.apellido_m) AS nombre, p.id_persona, \
                            p.rut, u.id_usuario, r.nombre_rol, u.vigente \
                            FROM persona p \
                                INNER JOIN usuario u ON p.id_persona = u.id_persona \
                                INNER JOIN rol r ON u.id_rol = r.id_rol \
                                ORDER BY p.apellido_p");
    }

    static getAllCarrers () {
        return pgQuery.any("SELECT * FROM carrera ORDER BY nombre_carrera");
    }

    static getAllTeachers () {
        return pgQuery.any("SELECT CONCAT(p.nombre, ' ', p.apellido_p, ' ', p.apellido_m) AS nombre, p.id_persona, \
                                    p.rut, pro.vigente \
                            FROM persona p INNER JOIN profesor pro ON p.id_persona = pro.id_profesor ORDER BY p.apellido_p");
    }

    static getAllStudents () {
        return pgQuery.any("SELECT CONCAT(p.nombre, ' ', p.apellido_p, ' ', p.apellido_m) AS nombre, p.id_persona, \
                                    p.rut, a.vigente \
                            FROM persona p INNER JOIN alumno a ON p.id_persona = a.id_alumno ORDER BY nombre");
    }

    static getCarrerById (id:number){
        return pgQuery.one("SELECT nombre_carrera FROM carrera WHERE carrera.id_carrera = $1",id)
            .catch(() => { throw new Error ('CARRER_GET_ERROR') });
    }

    static getTeacherById (id:number){
        return pgQuery.one("SELECT p.nombre, p.apellido_p, p.apellido_m, p. rut, p.correo_ucn \
                            FROM persona p WHERE p.id_persona = $1",id)
            .catch(() => { throw new Error ('TEACHER_GET_ERROR') });
    }

    static getStudentById (id:number){
        return pgQuery.one("SELECT p.nombre, p.apellido_p, p.apellido_m, p. rut, p.correo_ucn, c.id_carrera, c.nombre_carrera \
                            FROM persona p \
                                INNER JOIN alumno a ON p.id_persona = a.id_alumno \
                                INNER JOIN carrera c ON a.id_carrera = c.id_carrera \
                            WHERE p.id_persona = $1",id)
            .catch(() => { throw new Error ('STUDENT_GET_ERROR') });
    }

    static async desactivateTeacher (id:number) {
        return pgQuery.one('UPDATE profesor SET vigente = $1 WHERE id_profesor = $2 RETURNING id_profesor',[false,id])
            .catch(() => { throw new Error ('TEACHER_UPDATE_ERROR') });
    }

    static async activateTeacher (id:number) {
        return pgQuery.one('UPDATE profesor SET vigente = $1 WHERE id_profesor = $2 RETURNING id_profesor',[true,id])
            .catch(() => { throw new Error ('TEACHER_UPDATE_ERROR') });
    }

    static async desactivateStudent (id:number) {
        return pgQuery.one('UPDATE alumno SET vigente = $1 WHERE id_alumno = $2 RETURNING id_alumno',[false,id])
            .catch(() => { throw new Error ('ALUMNO_UPDATE_ERROR') });
    }

    static async activateStudent (id:number) {
        return pgQuery.one('UPDATE alumno SET vigente = $1 WHERE id_alumno = $2 RETURNING id_alumno',[true,id])
            .catch(() => { throw new Error ('ALUMNO_UPDATE_ERROR') });
    }

    static async desactivateUser (id:number) {
        return pgQuery.one('UPDATE usuario SET vigente = $1 WHERE id_usuario = $2 RETURNING id_usuario',[false,id])
            .catch(() => { throw new Error ('ALUMNO_UPDATE_ERROR') });
    }

    static async activateUser (id:number) {
        return pgQuery.one('UPDATE usuario SET vigente = $1 WHERE id_usuario = $2 RETURNING id_usuario',[true,id])
            .catch(() => { throw new Error ('ALUMNO_UPDATE_ERROR') });
    }

}