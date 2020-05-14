import pgQuery from '../middleware/pgPromise';

export interface LoginDBData {
    rut: string;
    nombre: string;
    apellidoP: string;
    apellidoM: string;
    correoUcn: string;
    idUsuario: number;
    passHash: string;
    nombreRol: string;
    idRol: number;
    idJuego?: number;
    idGrupo?: number;
    idJugador?: number;
    idJugadorDesignado?: number;
    juegoConcluido?:boolean;
}

export interface TokenDBData {
    idUsuario: number;
    ultimaIp: string;
    tokenS: string;
    idRol: number;
    nombreRol:string;
    idJuego?: number;
    idJugador?: number;
    idJugadorDesignado?: number;
    juegoConcluido?:boolean;
}

export default class AuthModel {
    static getLoginData(rut:string, teamname:string = "") : Promise<LoginDBData>{
        if (teamname !== "") {
            return pgQuery.one<LoginDBData>('\
                SELECT p.rut, p.nombre, p.apellido_p, p.apellido_m, p.correo_ucn, \
                    u.id_usuario, u.pass_hash, r.nombre_rol, r.id_rol, j.id_juego, \
                    g.id_grupo, ju.id_jugador, g.id_jugador_designado, j.concluido AS juego_concluido \
                FROM grupo g \
                    INNER JOIN juego j ON g.id_juego = j.id_juego \
                    INNER JOIN jugador ju ON ju.id_grupo = g.id_grupo \
                    INNER JOIN persona p ON p.id_persona = ju.id_alumno \
                    INNER JOIN alumno a ON p.id_persona = a.id_alumno \
                    INNER JOIN usuario u ON u.id_persona = p.id_persona \
                    INNER JOIN rol r ON r.id_rol = u.id_rol \
                WHERE g.vigente = TRUE AND ju.vigente = TRUE AND u.vigente = TRUE AND a.vigente = TRUE \
                    AND g.nombre_grupo = $1 AND p.rut = $2',[teamname, rut]
                ).catch(() => { throw new Error ("TEAMNAME_OR_PLAYER_NOT_FOUND")});
        } else {
            return pgQuery.one<LoginDBData>('\
                SELECT p.rut, p.nombre, p.apellido_p, p.apellido_m, p.correo_ucn, \
                    u.id_usuario, u.pass_hash, r.nombre_rol, r.id_rol \
                FROM persona p \
                    INNER JOIN usuario u ON u.id_persona = p.id_persona \
                    INNER JOIN rol r ON r.id_rol = u.id_rol \
                WHERE u.vigente = TRUE AND p.rut = $1 AND p.id_persona NOT IN (SELECT id_alumno FROM alumno)',rut
                ).catch(() => { throw new Error ("USER_NOT_FOUND")});
        }
    }   

    static setLogin(userId:number, ipAddress:string, crypt:string) {
        return pgQuery.one('UPDATE usuario SET ultima_ip = $1, token_s = $3 WHERE id_usuario = $2 RETURNING id_usuario',[ipAddress,userId,crypt]);
    }   

    // FUNCIONES PARA LA VALIDACIÓN DEL TOKEN

    static getTokenData (userId:number,teamId:number = 0) : Promise <TokenDBData>{
        if (teamId != 0) {
            return pgQuery.one<TokenDBData>('\
                SELECT u.id_usuario, u.ultima_ip, u.token_s, u.id_rol, r.nombre_rol, g.id_juego, \
                    ju.id_jugador, g.id_jugador_designado, j.concluido AS juego_concluido \
                FROM grupo g \
                    INNER JOIN juego j ON g.id_juego = j.id_juego \
                    INNER JOIN jugador ju ON g.id_grupo = ju.id_grupo \
                    INNER JOIN alumno a ON ju.id_alumno = a.id_alumno \
                    INNER JOIN usuario u ON a.id_alumno = u.id_persona \
                    INNER JOIN rol r ON u.id_rol = r.id_rol \
                WHERE g.vigente = TRUE AND ju.vigente = TRUE AND u.vigente = TRUE AND a.vigente = TRUE \
                    AND g.id_grupo = $1 AND u.id_usuario = $2',[teamId, userId]
            ).catch(() => { throw new Error('TEAMNAME_OR_PLAYER_NOT_FOUND'); });
        } else {
            return pgQuery.one<TokenDBData>('\
                SELECT u.id_usuario, u.ultima_ip, u.token_s, u.id_rol, r.nombre_rol \
                FROM usuario u \
                    INNER JOIN persona p ON u.id_persona = p.id_persona \
                    LEFT OUTER JOIN alumno a ON p.id_persona = a.id_alumno \
                    LEFT OUTER JOIN profesor f ON p.id_persona = f.id_profesor \
                    INNER JOIN rol r ON u.id_rol = r.id_rol \
                WHERE id_usuario = $1 AND u.vigente = TRUE AND ( \
                        (f.vigente IS NOT NULL AND f.vigente = TRUE) OR \
                        (a.vigente IS NOT NULL AND a.vigente = TRUE) \
                    )',
                userId
            ).catch(() => { throw new Error('USER NOT FOUND'); });;
        }
    }

    static destroyTokenByUserId (userId:number) : Promise<{idUsuario:number}>{
        return pgQuery.one('UPDATE usuario SET ultima_ip = NULL, token_s = NULL WHERE id_usuario = $1 RETURNING id_usuario',[userId]);
    }

    // COMPROBAR SI EL USUARIO ES UN PROFESOR
    static getUserIsTeacher (userId:number) {
        return pgQuery.one('\
            SELECT r.nombre_rol FROM usuario u INNER JOIN rol r ON r.id_rol = u.id_rol \
                LEFT OUTER JOIN profesor p ON p.id_profesor = u.id_persona \
            WHERE ( u.id_rol = 1 OR (p.id_profesor IS NOT NULL AND p.vigente = TRUE) ) \
                AND u.id_usuario = $1',userId
        );
    }

    // COMPROBAR SI EL USUARIO ES UN JUGADOR Y SI ES LIDER DE GRUPO
    static async getUserIsPlayer (userId:number,teamId:number) {
        let playersId = await pgQuery.many('\
            SELECT j.id_jugador \
            FROM usuario u INNER JOIN rol r ON u.id_rol = r.id_rol \
                INNER JOIN alumno a ON u.id_persona = a.id_alumno \
                INNER JOIN jugador j ON a.id_alumno = j.id_alumno \
            WHERE a.vigente = TRUE AND j.vigente = TRUE AND u.id_rol = 3 \
                AND u.id_usuario = $1',userId
        ).catch(() => { throw new Error('USER_NOT_PLAYER') });

        playersId = playersId.map(e => e.idJugador);
        
        return pgQuery.one('\
            SELECT ju.id_jugador, g.id_grupo, g.id_jugador_designado, j.concluido \
            FROM jugador ju INNER JOIN grupo g ON g.id_grupo = ju.id_grupo \
                INNER JOIN juego j ON g.id_juego = j.id_juego \
            WHERE g.vigente = TRUE AND ju.id_jugador IN ($1:list) \
                AND ju.id_grupo = $2',[playersId,teamId]
        ).catch(() => { throw new Error('PLAYER_NOT_IN_GROUP')});
    }
}