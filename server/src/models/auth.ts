import pgQuery from '../middleware/pgPromise';

export interface LoginDBData {
    idUsuario: number;
    nombre: string;
    apellidoP: string;
    apellidoM: string;
    passHash: string;
    idRol: number;
    nombreRol: string;
    idJuego?: number;
    idGrupo?: number;
    nombreGrupo?: string;
    idJugador?: number;
    idJugadorDesignado?: number;
    juegoConcluido?:boolean;
}

export interface TokenDBData {
    idUsuario: number;
    nombre: string;
    apellidoP: string;
    apellidoM: string;
    ultimaIp: string;
    tokenS: string;
    idRol: number;
    nombreRol:string;
    idJuego?: number;
    idGrupo?: number;
    nombreGrupo?: string;
    idJugador?: number;
    idJugadorDesignado?: number;
    juegoConcluido?:boolean;
}

export default class AuthModel {
    static async getLoginData(rut:string, teamname:string = "") : Promise<LoginDBData>{
        if (teamname !== "") {
            try {
                return pgQuery.one<LoginDBData>('\
                SELECT u.id_usuario, p.nombre, p.apellido_p, p.apellido_m, \
                    u.pass_hash, r.id_rol, r.nombre_rol, j.id_juego, \
                    g.id_grupo, g.nombre_grupo, ju.id_jugador, g.id_jugador_designado, \
                    j.concluido AS juego_concluido \
                FROM grupo g \
                    INNER JOIN juego j ON g.id_juego = j.id_juego \
                    INNER JOIN jugador ju ON ju.id_grupo = g.id_grupo \
                    INNER JOIN persona p ON p.id_persona = ju.id_alumno \
                    INNER JOIN alumno a ON p.id_persona = a.id_alumno \
                    INNER JOIN usuario u ON u.id_persona = p.id_persona \
                    INNER JOIN rol r ON r.id_rol = u.id_rol \
                WHERE g.vigente = TRUE AND ju.vigente = TRUE AND u.vigente = TRUE AND a.vigente = TRUE \
                    AND g.nombre_grupo = $1 AND p.rut = $2', [teamname, rut]);
            }
            catch (e) {
                throw new Error("TEAMNAME_OR_PLAYER_NOT_FOUND");
            }
        } else {
            try {
                return pgQuery.one<LoginDBData>('\
                SELECT p.rut, p.nombre, p.apellido_p, p.apellido_m, p.correo_ucn, \
                    u.id_usuario, u.pass_hash, r.nombre_rol, r.id_rol \
                FROM persona p \
                    INNER JOIN usuario u ON u.id_persona = p.id_persona \
                    INNER JOIN rol r ON r.id_rol = u.id_rol \
                WHERE u.vigente = TRUE AND p.rut = $1 AND p.id_persona NOT IN (SELECT id_alumno FROM alumno)', rut);
            }
            catch (e) {
                throw new Error("USER_NOT_FOUND");
            }
        }
    }   

    static async setLogin(userId:number, ipAddress:string, crypt:string) {
        return pgQuery.one('\
            UPDATE usuario \
            SET ultima_ip = $1, token_s = $3 \
            WHERE id_usuario = $2 RETURNING id_usuario',
            [ipAddress,userId,crypt]
        );
    }   

    // FUNCION PARA LA VALIDACIÓN DEL TOKEN
    static async getTokenData (userId:number,teamId:number = 0) : Promise <TokenDBData>{
        if (teamId != 0) {
            try {
                return pgQuery.one<TokenDBData>('\
                SELECT u.id_usuario, p.nombre, p.apellido_p, p.apellido_m, \
                    u.ultima_ip, u.token_s, u.id_rol, r.nombre_rol, g.id_juego, \
                    g.id_grupo, g.nombre_grupo, ju.id_jugador, g.id_jugador_designado, \
                    j.concluido AS juego_concluido \
                FROM grupo g \
                    INNER JOIN juego j ON g.id_juego = j.id_juego \
                    INNER JOIN jugador ju ON g.id_grupo = ju.id_grupo \
                    INNER JOIN alumno a ON ju.id_alumno = a.id_alumno \
                    INNER JOIN persona p ON a.id_alumno = p.id_persona\
                    INNER JOIN usuario u ON p.id_persona = u.id_persona \
                    INNER JOIN rol r ON u.id_rol = r.id_rol \
                WHERE g.vigente = TRUE AND ju.vigente = TRUE AND u.vigente = TRUE AND a.vigente = TRUE \
                    AND g.id_grupo = $1 AND u.id_usuario = $2', [teamId, userId]);
            }
            catch (e) {
                throw new Error('TEAMNAME_OR_PLAYER_NOT_FOUND');
            }
        } else {
            try {
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
                    )', userId);
            }
            catch (e) {
                throw new Error('USER NOT FOUND');
            };
        }
    }

    static async destroyTokenByUserId (userId:number) : Promise<{idUsuario:number}>{
        return pgQuery.one('UPDATE usuario SET ultima_ip = NULL, token_s = NULL WHERE id_usuario = $1 RETURNING id_usuario',[userId]);
    }

}