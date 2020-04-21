import pgQuery from '../middleware/pgPromise'
import moment, { Moment } from 'moment'

export default class HistoryModel {

    /* --------------------------------- HISTORIAL DE ACCIONES --------------------------------- */

    static getAllActionsHistory () {
        return pgQuery.any('\
            SELECT id_historial, id_usuario, accion_momento, accion_codigo, accion_mensaje, accion_id \
            FROM historial_acciones ORDER BY accion_momento ASC'
        );
    }

    static getActionHistoryByUserId (id:number) {
        return pgQuery.any('\
            SELECT id_historial, id_usuario, accion_momento, accion_codigo, accion_mensaje, accion_id \
            FROM historial_acciones WHERE id_usuario = $1 ORDER BY accion_momento ASC',id
        );
    }

    static async saveActionLog (idUser:number, moment:Moment, code:number, msg: string, id:number = 0, tableName:string = '', tableId:string = '') {
        if (id <= 0) id = 0;
        //
    }

    /* --------------------------------- HISTORIAL DE JUEGO --------------------------------- */
    
    static getAllGameHistory () {
        return pgQuery.any('\
            SELECT id_historial, id_participante, accion_momento, accion_mensaje, accion_codigo, accion_id, id_juego \
            FROM historial_acciones ORDER BY accion_momento ASC'
        );
    }

    static getActionHistoryByGameId (id:number) {
        return pgQuery.any('\
            SELECT id_historial, id_participante, accion_momento, accion_mensaje, accion_codigo, accion_id, id_juego \
            FROM historial_acciones WHERE id_juego = $1 ORDER BY accion_momento ASC',id
        );
    }

    static async saveGameLog (idGame:number, idPlayer:number,moment:Moment, code:number, msg: string, id:number = 0, tableName:string = '', tableId:string = '') {
        if (id <= 0) id = 0;
        //
    }

}