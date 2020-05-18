import pgQuery from '../middleware/pgPromise';
import rndString from 'randomstring';
import bcrypt from 'bcryptjs';
import { PersonaSinUsuario } from '../interfaces/admin';

export default class AdminGeneralModel {


    static createUsers() : Promise<PersonaSinUsuario[]>{
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
                WHERE (al.vigente IS NOT NULL AND al.vigente = TRUE)  \
                    OR (pr.vigente IS NOT NULL AND pr.vigente = TRUE) \
                    AND (j.concluido IS NULL OR j.concluido = FALSE) \
                    AND (ju.vigente IS NULL OR ju.vigente = TRUE) \
                    AND u.id_usuario IS NULL"
            );
            const success:PersonaSinUsuario[] = [];

            for (const p of data) {
                p.claveGenerada = rndString.generate({length: 10, charset: '23456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.-_@:;'});
                let hash = bcrypt.hashSync(p.claveGenerada,12);

                let i = await t.one('\
                    INSERT INTO usuario (pass_hash,id_persona,id_rol) VALUES ($1,$2,$3) RETURNING id_usuario',
                    [hash,p.idPersona,(p.rol=="ADMINISTRADOR" ? 1 : (p.rol=="JUGADOR" ? 3 : 2) )]
                );
                p.idUsuario = i.idUsuario;
                success.push(p);
            }

            return success;
        });
    }
}