import pgQuery from '../middleware/pgPromise';
import { StudentData, Persona } from '../interfaces/admin';

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
}