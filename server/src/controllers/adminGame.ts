import { Request, Response, NextFunction } from 'express';
import empty from 'is-empty';
import RUT from 'rut.js';

import Crypt from '../classes/crypt';

import checkError, { ErrorHandler } from '../middleware/errorHandler';

import { GroupData } from '../interfaces/admin';

import AdminGameModel from '../models/adminGame';
import AdminGeneralModel from '../models/adminGeneral';

export default class AdminGameController {

    // static async addNewGroups (req:Request, res:Response) {
    //     let gData:GroupData | GroupData[];
    //     if (req.body instanceof Array) {

    //         const errors:GroupData[] = [];
    //         let i = 0;
    //         let rutsUnicos:string[] = [];
    //         for (const gr of req.body) {
    //             const grErrors:GroupData = {};

    //             if (empty(gr.nombreGrupo))      grErrors.nombreGrupo = 'Ingrese un nombre de grupo.';
    //             else await AdminGameModel.getGroupByName(Number(req.params.gameId),gr.nombreGrupo)
    //                 .then(() => grErrors.nombreGrupo = 'El nombre del grupo ya existe en este juego.')
    //                 .catch(() => {});

    //             let bueno = true;
    //             let rutError = [];
                
    //             for (const rut of gr.ruts) {
    //                 if (!RUT.validate(rut)) {
    //                     rutError.push('El RUT ingresado no es válido'); bueno = false;
    //                 } else {
    //                     await AdminGameModel.getPlayerByRut(Number(req.params.gameId),rut.format(rut))
    //                     .then( () => {
    //                         rutError.push('El jugador ya está en otro equipo'); bueno = false;
    //                     }).catch( () => AdminGeneralModel.getPersonDataByRut(rut.format(rut)) )
    //                     .then( () => { 
    //                         if(rutsUnicos.find(rut.format(rut))) {
    //                             rutError.push('RUT duplicado en otro grupo'); bueno = false;
    //                         } else {
    //                             rutsUnicos.push(rut.format(rut));
    //                             rutError.push('');
    //                         }
    //                     }).catch( () => {rutError.push('El rut no existe en el sistema'); bueno = false } );
    //                 }
    //             }

    //             if (!empty(grErrors)) {  grErrors.id = i; errors.push(grErrors); }
    //             i++;
    //         }

    //         if (!empty(errors)) {
    //             let x = checkError(Error('WRONG_DATA'),errors);
    //             return res.status(x.httpCode).json(x.body);
    //         }

    //         gData = req.body;

    //     } else {
    //         gData = {};
    //     }

    //     AdminGameModel.addNewGroups(Number(req.params.gameId),gData)
    //     .then( (data) => {

    //         return res.json({msg: 'Grupos ingresados.'})
    //     })
    //     .catch((err:Error) => {
    //         let x = checkError(err);
    //         return res.status(x.httpCode).json(x.body);
    //     });
    // }

    static getAllGames(req: Request, res: Response) {
        AdminGameModel.getAllGames()
        .then( (data) => res.json({msg:'Juegos obtenidos', data: data}) )
        .catch( (err) => res.status(400).json({code: 1, msg: 'Error retornando los datos'}) )
    }

    static getDataGameById(req: Request, res: Response) {
        const id = Number(req.params.gameId);

        if (id == 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});
            
        AdminGameModel.getDataGameById(id)
        .then( (data) => res.json({msg:'Datos del Juego Obtenidos', data: data}) )
        .catch( (err:Error) => {
            if (err.message == 'GAME_GET_ERROR') {
                return res.status(400).json({code: 1, msg: 'No se pudo obtener los datos del Juego'});
            } else {
                return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
            }
        });
    }

    static getPlayersByGameId(req: Request, res: Response) {
        const id = Number(req.params.gameId);

        if (id == 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});
            
        AdminGameModel.getPlayersByGameId(id)
        .then( (data) => res.json({msg:'Datos de los Jugadores Obtenidos', data: data}) )
        .catch( (err:Error) => {
            if (err.message == 'PLAYERS_GET_ERROR') {
                return res.status(400).json({code: 1, msg: 'No se pudo obtener los datos de los Jugadores'});
            } else {
                return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
            }
        });
    }
}