import pgQuery from '../middleware/pgPromise'
export default class DataModel {

    static getServerTime () {
        return pgQuery.one('SELECT NOW() AS momento');
    }

    /* --------------------------------- CARRERAS --------------------------------- */

    static getAllCarreras () {
        return pgQuery.any('SELECT id_carrera, nombre_carrera FROM carrera ORDER BY nombre_carrera');
    }

    static getCarreraById (id:number) {
        return pgQuery.one('SELECT id_carrera, nombre_carrera FROM carrera WHERE id_carrera = $1',id)
            .catch(() => { throw new Error ('CARRERA_GET_ERROR') });
    }

    static async createCarrera (name:string) {
        await pgQuery.none('SELECT * FROM carrera WHERE UPPER(nombre_carrera) = UPPER($1)',name)
            .catch(() => { throw new Error ('CARRERA_DUPLICATE_ERROR') });

        return pgQuery.one('INSERT INTO carrera (nombre_carrera) VALUES ($1) RETURNING id_carrera',name)
            .catch(() => { throw new Error ('CARRERA_INSERT_ERROR') });
    }

    static async updateCarrera (id:number, name:string) {
        await pgQuery.none('SELECT * FROM carrera WHERE UPPER(nombre_carrera) = UPPER($1) AND id_carrera != $2',[name,id])
            .catch(() => { throw new Error ('CARRERA_DUPLICATE_ERROR') });

        return pgQuery.one('UPDATE carrera SET nombre_carrera = $1 WHERE id_carrera = $2 RETURNING id_carrera',[name,id])
            .catch(() => { throw new Error ('CARRERA_UPDATE_ERROR') });
    }


    /* ---------------------------------- ROLES ---------------------------------- */

    static getAllRoles () {
        return pgQuery.any('SELECT id_rol, nombre_rol FROM rol ORDER BY nombre_rol');
    }

    static getRolById (id:number) {
        return pgQuery.one('SELECT id_rol, nombre_rol FROM rol WHERE id_rol = $1',id)
            .catch(() => { throw new Error ('ROL_GET_ERROR') });
    }

}