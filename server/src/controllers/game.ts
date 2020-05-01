import { Request, Response } from 'express'
import empty from 'is-empty'
import moment from 'moment';

import checkError from '../middleware/errorHandler';

import GameModel from '../models/game'

export default class GameController {

    public static getAllGames (req:Request, res:Response) {
        GameModel.getAllGames()
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err) => res.status(500).json({code: 1, msg: 'Error interno del servidor'}) );
    }

    public static getGameById (req:Request, res:Response) {
        const id = Number(req.params.gameId);
        
        GameModel.getGameById(id)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getAllGameCities (req:Request, res:Response) {
        const id = Number(req.params.gameId);
        
        GameModel.getAllGameCities(id)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getGameCityById (req:Request, res:Response) {
        const idJuego = Number(req.params.gameId);
        const idCiudad = Number(req.params.cityId);
        
        GameModel.getGameCityById(idJuego, idCiudad)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getAllGameCityProducts (req:Request, res:Response) {
        const idJuego = Number(req.params.gameId);
        const idCiudad = Number(req.params.cityId);

        GameModel.getAllGameCityProducts(idJuego,idCiudad)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getGameCityProductById (req:Request, res:Response) {
        const idJuego = Number(req.params.gameId);
        const idCiudad = Number(req.params.cityId);
        const idProducto = Number(req.params.productId);

        GameModel.getGameCityProductById(idJuego,idCiudad,idProducto)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getAllProducts (req:Request, res:Response) {
        const idJuego = Number(req.params.gameId);

        GameModel.getAllProducts(idJuego)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getProductById (req:Request, res:Response) {
        const idJuego = Number(req.params.gameId);
        const idProducto = Number(req.params.productId);

        GameModel.getProductById(idJuego,idProducto)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getAllplayers (req:Request, res:Response) {
        const idJuego = Number(req.params.gameId);

        GameModel.getAllplayers(idJuego)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getPlayerById (req:Request, res:Response) {
        const idJuego = Number(req.params.gameId);
        const idJugador = Number(req.params.playerId);

        GameModel.getPlayerById(idJuego,idJugador)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getAllGroups (req:Request, res:Response) {
        const idJuego = Number(req.params.gameId);

        GameModel.getAllGroups(idJuego)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getGroupById (req:Request, res:Response) {
        const idJuego = Number(req.params.gameId);
        const idGrupo = Number(req.params.groupId);

        GameModel.getGroupById(idJuego,idGrupo)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getGroupCityTrades (req:Request, res:Response) {
        const idJuego = Number(req.params.gameId);
        const idGrupo = Number(req.params.groupId);

        GameModel.getGroupCityTrades(idJuego,idGrupo)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getGroupCityTradeById (req:Request, res:Response) {
        const idJuego = Number(req.params.gameId);
        const idGrupo = Number(req.params.groupId);
        const idIntercambio = Number(req.params.tradeId);

        GameModel.getGroupCityTradeById(idJuego,idGrupo,idIntercambio)
        .then((data) => res.json({msg: 'Datos recuperados', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    /**
     * @todo VALIDACIONES DE DATOS
     */
    public static doTrade (req:Request, res:Response) {
        if (!(req.body instanceof Array))
            return res.status(400).json({code:1, msg: 'Ingrese la lista de productos'});

        const 
            errors:any[] = [], 
            body:any[] = req.body,
            idJuego = Number(req.params.gameId),
            idGrupo = Number(req.params.groupId),
            idCiudad = Number(req.params.cityId),
            productos:any = [];

        body.forEach( p => {
            const pErr:any = {};

            if (empty(p.idProducto))    pErr.idProducto = 'Ingrese un producto';

            if (empty(p.esCompra) || (p.esCompra != 'true' && p.esCompra != 'false'))      
                pErr.esCompra = 'Indique si el producto es para compra o venta';
            
            if (Number(p.cantidad) == 0 || Number(p.cantidad) == NaN) 
                pErr.cantidad = 'Ingrese una cantidad de producto válida';

            if (!empty(pErr))
                errors.push(pErr);
            else
                productos.push({ idProducto: p.idProducto, esCompra: p.esCompra, cantidad: p.cantidad });
        })

        if (!empty(errors)) {
            const x = checkError(new Error('WRONG_DATA'),errors);
            return res.status(x.httpCode).json(x.body);
        }

        GameModel.doTrade(idJuego,idGrupo,idCiudad,moment(),productos)
        .then((data) => res.json({msg: 'Transacción realizada'}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })
    }

}