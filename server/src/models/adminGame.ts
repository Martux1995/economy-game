import pgQuery from '../middleware/pgPromise';
import { GroupData, Jugador, Grupo, Juego } from '../interfaces/admin';
import moment, { Moment } from 'moment';
import DataModel from './data';
import EmailSender, { MailData } from '../middleware/emailSender';
import isEmpty from 'is-empty';

export default class AdminGameModel {

    static async updateGameProperties () : Promise<boolean> {
        const x = await pgQuery.any<Juego>('\
            SELECT * FROM juego j INNER JOIN config_juego cj ON cj.id_juego = j.id_juego \
            WHERE concluido = FALSE'
        );
        
        const y = await DataModel.getServerTime();
        const actualTime:Moment = moment(y.momento);
        
        //
        let newLeaders:Jugador[] = [];
        // Para cada juego
        for (const game of x) {

            // Cobro de los bloques extra
            const blockTime:Moment = moment(game.proxCobroBloqueExtra);
            if (blockTime < actualTime) {
                await pgQuery.tx(async t => {
                    await t.any('\
                        UPDATE grupo SET dinero_actual = dinero_actual - ($1 * bloques_extra) \
                        WHERE id_juego = $2 AND vigente = TRUE',[game.precioBloqueExtra,game.idJuego]
                    );
                    await t.one("\
                        UPDATE config_juego \
                        SET prox_cobro_bloque_extra = prox_cobro_bloque_extra + (freq_cobro_bloque_extra_dias || ' DAYS')::INTERVAL \
                        WHERE id_juego = $1 RETURNING id_juego",game.idJuego
                    );
                });
            } else if (process.env.NODE_ENV !== "production") {
                console.log('not charge blocks yet');
                
            }

            // Cobro del impuesto del juego
            const taxTime:Moment = moment(game.proxCobroImpuesto);
            if (taxTime < actualTime) {
                await pgQuery.tx(async t => {
                    await t.any('\
                        UPDATE grupo SET dinero_actual = dinero_actual - $1 \
                        WHERE id_juego = $2 AND vigente = TRUE',[game.valorImpuesto,game.idJuego]
                    );
                    await t.one("\
                        UPDATE config_juego \
                        SET prox_cobro_impuesto = prox_cobro_impuesto + (freq_cobro_impuesto_dias || ' DAYS')::INTERVAL \
                        WHERE id_juego = $1 RETURNING id_juego",game.idJuego
                    );
                });
            } else if (process.env.NODE_ENV !== "production") {
                console.log('not charge tax yet');
            }

            // Cambio de los líderes
            const leaderTime:Moment = moment(game.proxRotacionLideres);
            if (leaderTime < actualTime) {
                await pgQuery.tx(async t => {
                    let groups = await t.any<{idGrupo:number, posiblesLideres:number[]}>('\
                        SELECT j.id_grupo, array_agg(j.id_jugador) AS posibles_lideres \
                        FROM ( \
                            SELECT g.id_grupo, MAX(j.veces_designado) AS maximo, MIN(j.veces_designado) AS minimo \
                            FROM jugador j INNER JOIN grupo g ON j.id_grupo = g.id_grupo  \
                            WHERE g.vigente = TRUE AND j.vigente = TRUE AND j.id_juego = $1 \
                            GROUP BY g.id_grupo \
                        ) AS jv INNER JOIN jugador j ON j.id_grupo = jv.id_grupo \
                        WHERE jv.minimo = j.veces_designado AND j.vigente = TRUE \
                        GROUP BY j.id_grupo',game.idJuego
                    );

                    let leadersId:number[] = [];

                    for (const g of groups) {                 
                        let newLeader = g.posiblesLideres[Math.floor(Math.random() * g.posiblesLideres.length)];
                        await t.one('UPDATE grupo SET id_jugador_designado = $1 WHERE id_grupo = $2 RETURNING id_grupo',[newLeader,g.idGrupo]);
                        leadersId.push(newLeader);
                    }

                    await t.any('\
                        UPDATE jugador SET veces_designado = veces_designado + 1 \
                        WHERE id_jugador IN (SELECT DISTINCT id_jugador_designado FROM grupo) \
                        RETURNING id_jugador'
                    );

                    await t.one("\
                        UPDATE config_juego \
                        SET prox_rotacion_lideres = prox_rotacion_lideres + (freq_rotacion_lideres_dias || ' DAYS')::INTERVAL \
                        WHERE id_juego = $1 RETURNING id_juego",game.idJuego
                    );
                    for (const d of await this.getPlayerById(game.idJuego,leadersId)) {
                        newLeaders.push(d);
                    }
                });
            } else if (process.env.NODE_ENV !== "production") {
                console.log('not team leader change yet');
            }
            
        }

        const mails:MailData[] = newLeaders.map(l => {
            return {
                to:l.correoUcn,
                data: {
                    playerName: `${l.nombre} ${l.apellidoP}${l.apellidoM ? ' '+l.apellidoM : ''}`
                }
            }
        });
        if (!isEmpty(mails))
            EmailSender.sendMail("newLeaderGroup.html","Nuevo lider designado",mails);
        else if (process.env.NODE_ENV !== "production")
            console.log('no mails sended');
            

        return true;
    }

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

    static getPlayerById (gameId:number,playerId:number) : Promise<Jugador>;
    static getPlayerById (gameId:number,playerId:number[]) : Promise<Jugador[]>;
    static getPlayerById (gameId:number,playerId:any) : Promise<Jugador|Jugador[]> {
        if (playerId instanceof Array) {
            return pgQuery.any<Jugador>('\
                SELECT * \
                FROM jugador j \
                    INNER JOIN grupo g ON j.id_grupo = g.id_grupo \
                    INNER JOIN alumno a ON j.id_alumno = a.id_alumno \
                    INNER JOIN persona p ON a.id_alumno = p.id_persona \
                WHERE g.id_juego = $1 AND j.id_jugador IN ($2:list)',
                [gameId, playerId]
            );
        } else {
            return pgQuery.one<Jugador>('\
                SELECT * \
                FROM jugador j \
                    INNER JOIN grupo g ON j.id_grupo = g.id_grupo \
                    INNER JOIN alumno a ON j.id_alumno = a.id_alumno \
                    INNER JOIN persona p ON a.id_alumno = p.id_persona \
                WHERE j.id_jugador = $1 AND g.id_juego = $2',[playerId,gameId]
            );
        }
    }

    // static addNewGroups (gameId:number,gData:GroupData | GroupData[]) : Promise<boolean> {
    //     return pgQuery.tx(async t => {
    //         let juego = await this.getGameById(gameId).catch((err) => {throw Error('GAME_NOT_EXISTS')});

    //         if (gData instanceof Array) {
    //             for (const g of gData) {

    //                 let groupId = await t.one('\
    //                     INSERT INTO grupo (nombreGrupo,dineroActual,bloquesExtra,idJugadorDesignado,idJuego)\
    //                     VALUES ($1,$2,$3,$4,$5) RETURNING id_grupo',[g.nombreGrupo,juego.dineroInicial,0,null,gameId]
    //                 );
                    

    //                 for (const rut of g.ruts!) {
                        
    //                 }
                    
    //             }
    //         }

    //         return true;
    //     });
    // }

    static getAllGames () {
        return pgQuery.any("SELECT id_juego, nombre, semestre, concluido, to_char(fecha_inicio, 'DD/MM/YYYY') AS fecha_inicio FROM juego ORDER BY nombre");
    }
    
    static getGameById (gameId:number) : Promise<Juego>{
        return pgQuery.one<Juego>('\
            SELECT * FROM juego j INNER JOIN config_juego cj ON cj.id_juego = j.id_juego \
            WHERE id_juego = $1',gameId
        );
    };

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
        return pgQuery.any("SELECT CONCAT(p.nombre, ' ', p.apellido_p, ' ', p.apellido_m) AS nombre, p. rut, j.id_alumno, j.id_jugador, j.id_grupo, g.nombre_grupo \
                            FROM persona p \
                                INNER JOIN jugador j ON p.id_persona = j.id_alumno \
                                INNER JOIN grupo g ON j.id_grupo = g.id_grupo \
                            WHERE j.id_juego = $1",id)
            .catch(() => { throw new Error ('PLAYERS_GET_ERROR') });
    }
}