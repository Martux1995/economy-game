import pgQuery from '../middleware/pgPromise'

export default class AuthModel {
    static getLoginData(rut:string, teamname:string = "") {
        if (teamname !== "") {
            return pgQuery.one('\
                SELECT p.rut, p.nombre, p.apellido_p, p.apellido_m, p.correo_ucn, \
                    u.id_usuario, u.pass_hash, r.nombre_rol, r.id_rol \
                FROM grupo g \
                    INNER JOIN juego j ON g.id_juego = j.id_juego \
                    INNER JOIN jugador ju ON ju.id_jugador = g.id_jugador_designado \
                    INNER JOIN persona p ON p.id_persona = ju.id_alumno \
                    INNER JOIN usuario u ON u.id_persona = p.id_persona \
                    INNER JOIN rol r ON r.id_rol = u.id_rol \
                WHERE j.concluido = FALSE AND g.nombre_grupo = $1 AND p.rut = $2',[teamname, rut]
                ).catch(() => { throw new Error ("TEAMNAME_OR_PLAYER_NOT_FOUND")});
        } else {
            return pgQuery.one('\
                SELECT p.rut, p.nombre, p.apellido_p, p.apellido_m, p.correo_ucn, \
                    u.id_usuario, u.pass_hash, r.nombre_rol, r.id_rol \
                FROM persona p \
                    INNER JOIN usuario u ON u.id_persona = p.id_persona \
                    INNER JOIN rol r ON r.id_rol = u.id_rol \
                WHERE p.rut = $1 AND p.id_persona NOT IN (SELECT id_alumno FROM alumno)',rut
                ).catch(() => { throw new Error ("USER_NOT_FOUND")});
        }
    }   

    static setLogin(userId:number, ipAddress:string) {
        return pgQuery.one('UPDATE usuario SET ultima_ip = $1 WHERE id_usuario = $2 RETURNING id_usuario',[ipAddress,userId]);
    }   

    static getTokenDataByUserId (userId:number) {
        return pgQuery.one('SELECT id_usuario, ultima_ip FROM usuario WHERE id_usuario = $1',userId);
    }
}