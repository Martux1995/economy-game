import pgQuery from '../middleware/pgPromise';

export default class AuthModel {
    static getLoginData(rut:string, teamname:string = "") {
        if (teamname !== "") {
            return pgQuery.one('\
                SELECT p.rut, p.nombre, p.apellido_p, p.apellido_m, p.correo_ucn, \
                    u.id_usuario, u.pass_hash, r.nombre_rol, r.id_rol, j.id_juego, \
                    g.id_grupo, ju.id_jugador, g.id_jugador_designado \
                FROM grupo g \
                    INNER JOIN juego j ON g.id_juego = j.id_juego \
                    INNER JOIN jugador ju ON ju.id_grupo = g.id_grupo \
                    INNER JOIN persona p ON p.id_persona = ju.id_alumno \
                    INNER JOIN usuario u ON u.id_persona = p.id_persona \
                    INNER JOIN rol r ON r.id_rol = u.id_rol \
                WHERE j.concluido = FALSE AND g.vigente = TRUE AND ju.vigente = TRUE AND u.vigente = TRUE \
                    AND g.nombre_grupo = $1 AND p.rut = $2',[teamname, rut]
                ).catch(() => { throw new Error ("TEAMNAME_OR_PLAYER_NOT_FOUND")});
        } else {
            return pgQuery.one('\
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

    static getTokenDataByUserId (userId:number) {
        return pgQuery.one('SELECT id_usuario, ultima_ip, token_s FROM usuario WHERE id_usuario = $1',userId);
    }

    static destroyTokenByUserId (userId:number) {
        return pgQuery.one('UPDATE usuario SET ultima_ip = NULL, token_s = NULL WHERE id_usuario = $1 RETURNING id_usuario',[userId]);
    }

    static getIfHasTeacherRoleByUserId (userId:number) {
        return pgQuery.one('\
            SELECT r.nombre_rol FROM usuario u INNER JOIN rol r ON r.id_rol = u.id_rol \
                LEFT OUTER JOIN profesor p ON p.id_profesor = u.id_persona \
            WHERE ( u.id_rol = 1 OR (p.id_profesor IS NOT NULL AND p.vigente = TRUE) ) AND u.id_usuario = $1',userId
        );
    }

    static getIfHasPlayerRoleByUserId (userId:number) {
        return pgQuery.one('\
            SELECT r.nombre_rol FROM usuario u INNER JOIN rol r ON r.id_rol = u.id_rol \
                INNER JOIN alumno a ON a.id_alumno = u.id_persona \
            WHERE u.id_rol = 3 AND u.id_usuario = $1',userId
        );
    }
}