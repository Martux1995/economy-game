import pgQuery from '../middleware/pgPromise';

export interface Usuario {
    idUsuario?: number,
    passHash?: string,
    idPersona?: number,
    idRol?: number,
    ultimaIp?: string,
    tokenS?: string,
    tokenRc?: string,
    vigente?: boolean
}

export default class UserModel {

    /* CRUD USUARIOS */

    static getAllUsers () : Promise<Usuario[]>{
        return pgQuery.any<Usuario>('SELECT * FROM usuario');
    }

    static getUserById (userId:number): Promise<Usuario> {
        return pgQuery.one<Usuario>('SELECT * FROM usuario WHERE id_usuario = $1',userId);
    }

    static getUserByRut (rut:string) : Promise<Usuario> {
        return pgQuery.one<Usuario>('\
            SELECT * FROM usuario u INNER JOIN persona p ON p.id_usuario = u.id_persona\
            WHERE p.rut = $1',rut
        );
    }

    static updateUser (payload:Usuario) : Promise<{idUsuario:number}> {
        throw new Error('NOT IMPLEMENTED YET');
    }

    static deleteUser (userId:number) : Promise<{idUsuario:number}>{
        return pgQuery.one<{idUsuario:number}>('UPDATE usuario SET vigente = FALSE WHERE id_usuario = $1 RETURNING id_usuario',userId);
    }   

    /* FUNCIONES ESPECÍFICAS */
}