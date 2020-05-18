import pgQuery from '../middleware/pgPromise';
import { GroupData, Jugador, Grupo, Juego } from '../interfaces/admin';

export default class AdminGameModel {

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
                        VALUES ($1,$2,$3,$4,$5) RETURNING id_grupo',[g.nombreGrupo,juego.dinero_inicial,0,null,gameId]
                    );
                    

                    for (const rut of g.ruts!) {
                        
                    }
                    
                }
            }

            return true;
        });
    }
}