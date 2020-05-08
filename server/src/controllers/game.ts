import { Request, Response, NextFunction } from 'express'
import empty from 'is-empty'
import moment from 'moment';

import checkError from '../middleware/errorHandler';

import GameModel from '../models/game'

declare module 'express-serve-static-core' {
    interface Request {
        readonly userId: number,
        readonly teamId: number,
        gameProps: {
            id: number,
            canBuyBlocks: boolean,
            extraBlockPrice: number,
            buyTimesInCityDay: number
        }
    }
}

export default class GameController {

    public static getGameData (req: Request, res:Response, next:NextFunction) {
        GameModel.getGameDataByTeamId(req.teamId)
        .then((data) => {
            req.gameProps = {
                id: data.idJuego,
                canBuyBlocks: data.sePuedeComprarBloques,
                extraBlockPrice: data.precioBloqueExtra,
                buyTimesInCityDay: data.vecesCompraCiudadDia
            }
            next();
        })
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })
    }

    public static getAllGameCities (req:Request, res:Response) {
        GameModel.getAllGameCities(req.gameProps.id)
        .then((data) => res.json({msg: 'Ciudades obtenidas', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getGameCityById (req:Request, res:Response) {
        const idCiudad = Number(req.params.cityId);
        
        GameModel.getGameCityById(req.gameProps.id, idCiudad)
        .then((data) => res.json({msg: 'Ciudad obtenida', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getAllGameCityProducts (req:Request, res:Response) {
        const idCiudad = Number(req.params.cityId);

        GameModel.getAllGameCityProducts(req.gameProps.id,req.teamId,idCiudad)
        .then((data) => res.json({msg: 'Productos obtenidos', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getGameCityProductById (req:Request, res:Response) {
        const idCiudad = Number(req.params.cityId);
        const idProducto = Number(req.params.productId);

        GameModel.getGameCityProductById(req.gameProps.id,idCiudad,idProducto)
        .then((data) => res.json({msg: 'Producto obtenido', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getAllProducts (req:Request, res:Response) {
        GameModel.getAllProducts(req.gameProps.id)
        .then((data) => res.json({msg: 'Productos obtenidos', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getProductById (req:Request, res:Response) {
        const idProducto = Number(req.params.productId);

        GameModel.getProductById(req.gameProps.id,idProducto)
        .then((data) => res.json({msg: 'Producto obtenido', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    /**
     * @todo VALIDACIONES DE DATOS
     */
    public static async doTrade (req:Request, res:Response) {
        if (!(req.body instanceof Array)) {
            const x = checkError(new Error('PRODUCT_LIST_NOT_FOUND'));
            return res.status(x.httpCode).json(x.body);
        }
            
        const 
            errors:any[] = [],
            idCiudad = Number(req.params.cityId),
            productos:any = [],
            uniques:any[] = []

        for (let i = 0; i < req.body.length; i++) {
            const p = req.body[i];
            const pErr:any = {};

            if (!empty(p.idProducto)) {

                const id = p.idProducto;
                let product = await GameModel.checkProduct(idCiudad,p.idProducto);

                if (product == null) 
                    pErr.idProducto = 'El id de producto no es válido, no existe o la ciudad no lo tiene';
                else if ( uniques.find(val => val == id) )
                    pErr.idProducto = 'No se permiten productos duplicados';
                else if (empty(p.esCompra) || typeof p.esCompra !== 'boolean')
                    pErr.esCompra = 'Indique si el producto es para compra (true) o venta (false)';
                else if (typeof p.cantidad !== 'number' || Number(p.cantidad) === NaN || Number(p.cantidad) <= 0)
                    pErr.cantidad = 'Ingrese una cantidad de producto válida';

                if (!empty(pErr)) {
                    pErr.id = id;
                    errors.push(pErr);
                } else {
                    
                    productos.push({ 
                        idProducto: p.idProducto, 
                        esCompra: p.esCompra, 
                        cantidad: p.cantidad 
                    });
                    uniques.push(id);
                }
            }
        }

        if (!empty(errors)) {
            const x = checkError(new Error('WRONG_DATA'),errors);
            return res.status(x.httpCode).json(x.body);
        }

        if (empty(productos)) {
            const x = checkError(new Error('NO_PRODUCTS_TO_TRADE'));
            return res.status(x.httpCode).json(x.body);
        }

        GameModel.doTrade(req.gameProps.id,req.teamId,idCiudad,moment(),productos)
        .then((data) => res.json({msg: 'Transacción realizada'}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })
    }

    static getTruckInfo (req:Request, res:Response) {
        GameModel.getTruckInfo(req.gameProps.id, req.teamId)
        .then((data) => res.json({msg: 'Información obtenida', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    static async changeProductStorage (req:Request, res:Response) {
        if (!(req.body instanceof Array)) {
            const x = checkError(new Error('PRODUCT_LIST_NOT_FOUND'));
            return res.status(x.httpCode).json(x.body);
        }
            
        const 
            errors:any[] = [],
            productos:any = [],
            uniques:any[] = []

        for (let i = 0; i < req.body.length; i++) {
            const p = req.body[i];
            const pErr:any = {};

            if (!empty(p.idProducto)) {

                const id = p.idProducto;
                try {
                    let product = await GameModel.getProductById(req.gameProps.id,p.idProducto);

                    if ( uniques.find(val => val == product.idProducto) )
                        pErr.idProducto = 'No se permiten productos duplicados';
                    else if (empty(p.cargando) || typeof p.cargando !== 'boolean')
                        pErr.cargando = 'Indique si el producto se cargará (true) o descargará (false) del camión';
                    else if (typeof p.cantidad !== 'number' || Number(p.cantidad) === NaN || Number(p.cantidad) <= 0)
                        pErr.cantidad = 'Ingrese una cantidad de producto válida';
                } catch (err) {
                    pErr.idProducto = 'El id de producto no es válido o no existe';
                }

                if (!empty(pErr)) {
                    pErr.id = id;
                    errors.push(pErr);
                } else {
                    
                    productos.push({ 
                        idProducto: p.idProducto, 
                        cargando: p.cargando, 
                        cantidad: p.cantidad 
                    });
                    uniques.push(id);
                }
            }
        }

        if (!empty(errors)) {
            const x = checkError(new Error('WRONG_DATA'),errors);
            return res.status(x.httpCode).json(x.body);
        }

        if (empty(productos)) {
            const x = checkError(new Error('NO_PRODUCTS_TO_TRADE'));
            return res.status(x.httpCode).json(x.body);
        }

        GameModel.changeProductStorage(req.gameProps.id,req.teamId,productos)
        .then((data) => res.json({msg: 'Carga/descarga realizada'}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })      
    }


}