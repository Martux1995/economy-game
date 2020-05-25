import pgQuery from '../middleware/pgPromise';
import { GroupData, Jugador, Grupo, Juego } from '../interfaces/admin';
import moment, { Moment } from 'moment';

export default class AdminGameModel {

    static updateGameProperties () : Promise<boolean> {
        return pgQuery.tx(async t => {
            const x = await pgQuery.any<Juego>('\
                SELECT * FROM juego j INNER JOIN config_juego cj ON cj.id_juego = j.id_juego \
                WHERE concluido = FALSE'
            );

            const y = await t.one<{moment:string}>('SELECT NOW() as moment');

            const actualTime:Moment = moment(y.moment);

            for (const game of x) {
                const blockTime:Moment = moment(game.proxCobroBloqueExtra);

                if (blockTime < actualTime) {
                    await t.any('\
                        UPDATE grupo SET dinero_actual = dinero_actual - ($1 * bloques_extra) \
                        WHERE id_juego = $2 AND vigente = TRUE',[game.precioBloqueExtra,game.idJuego]
                    );
                    await t.one("\
                        UPDATE config_juego \
                        SET prox_cobro_bloque_extra = prox_cobro_bloque_extra + (freq_cobro_bloque_extra_dias || ' DAYS')::INTERVAL \
                        WHERE id_juego = $1 RETURNING id_juego",game.idJuego
                    );
                }

                const taxTime:Moment = moment(game.proxCobroImpuesto);
                if (taxTime < actualTime) {
                    await t.any('\
                        UPDATE grupo SET dinero_actual = dinero_actual - $1 \
                        WHERE id_juego = $2 AND vigente = TRUE',[game.valorImpuesto,game.idJuego]
                    );
                    await t.one("\
                        UPDATE config_juego \
                        SET prox_cobro_impuesto = prox_cobro_impuesto + (freq_cobro_impuesto_dias || ' DAYS')::INTERVAL \
                        WHERE id_juego = $1 RETURNING id_juego",game.idJuego
                    );
                }

                const leaderTime:Moment = moment(game.proxRotacionLideres);
                if (leaderTime < actualTime) {
                    


                }
            }

            
    
            return true;
        });
    }

    static getGameById (gameId:number) : Promise<Juego>{
        return pgQuery.one<Juego>('\
            SELECT * FROM juego j INNER JOIN config_juego cj ON cj.id_juego = j.id_juego \
            WHERE id_juego = $1',gameId
        );
    };

    static getGroupByName (gameId:number,name:string) : Promise<Grupo> {
        return pgQuery.one<Grupo>('\
            SELECT * FROM juego WHERE id_juego = $1 AND nombre_grupo = $2',
            [gameId,name]
        );
    }

    static getPlayerByRut (gameId:number,rut:string) : Promise<Jugador> {
        return pgQuery.one<Jugador>('\
            SELECT * \
            FROM jugador j \
                INNER JOIN grupo g ON j.id_grupo = g.id_grupo \
                INNER JOIN alumno a ON j.id_alumno = a.id_alumno \
                INNER JOIN persona p ON a.id_alumno = p.id_persona \
            WHERE p.rut = $1 AND g.id_juego = $2',[rut,gameId]
        );
    }

    static addNewGroups (gameId:number,gData:GroupData | GroupData[]) : Promise<boolean> {
        return pgQuery.tx(async t => {
            let juego = await this.getGameById(gameId).catch((err) => {throw Error('GAME_NOT_EXISTS')});

            if (gData instanceof Array) {
                for (const g of gData) {

                    let groupId = await t.one('\
                        INSERT INTO grupo (nombreGrupo,dineroActual,bloquesExtra,idJugadorDesignado,idJuego)\
                        VALUES ($1,$2,$3,$4,$5) RETURNING id_grupo',[g.nombreGrupo,juego.dineroInicial,0,null,gameId]
                    );
                    

                    for (const rut of g.ruts!) {
                        
                    }
                    
                }
            }

            return true;
        });
    }

    static getAllGames () {
        return pgQuery.any("SELECT id_juego, nombre, semestre, concluido, to_char(fecha_inicio, 'DD/MM/YYYY') AS fecha_inicio FROM juego ORDER BY nombre");
    }

    static getDataGameById (id:number){
        return pgQuery.one("SELECT *, to_char(fecha_inicio, 'DD/MM/YYYY') AS fecha_inicio_format, \
                                      to_char(fecha_termino, 'DD/MM/YYYY') AS fecha_termino_format, \
                                      to_char(prox_cobro_bloque_extra, 'DD/MM/YYYY') AS prox_cobro_bloque_extra_format, \
                                      to_char(prox_cobro_impuesto, 'DD/MM/YYYY') AS prox_cobro_impuesto_format, \
                                      to_char(prox_rotacion_lideres, 'DD/MM/YYYY') AS prox_rotacion_lideres_format \
                            FROM juego \
                                INNER JOIN config_juego ON juego.id_juego = config_juego.id_juego \
                            WHERE juego.id_juego = $1",id)
            .catch(() => { throw new Error ('GAME_GET_ERROR') });
    }

    static getPlayersByGameId (id:number){
        return pgQuery.any("SELECT p.nombre, p. rut, p.apellido_p, p.apellido_m, j.id_alumno, j.id_jugador, j.id_grupo, g.nombre_grupo \
                            FROM persona p \
                                INNER JOIN jugador j ON p.id_persona = j.id_alumno \
                                INNER JOIN grupo g ON j.id_grupo = g.id_grupo \
                            WHERE j.id_juego = $1",id)
            .catch(() => { throw new Error ('PLAYERS_GET_ERROR') });
    }
}