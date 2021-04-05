import { Request, Response, NextFunction } from 'express'
import empty from 'is-empty'
import moment from 'moment';

import { sendCityDataNotification } from '../middleware/webSocket';

import checkError from '../middleware/errorHandler';

import GameModel from '../models/game'
import { TradeItems } from '../interfaces/game';

export default class GameController {

    // Obtiene los datos requeridos del juego, para así ejecutar lo que se necesite
    public static getGameData (req: Request, res:Response, next:NextFunction) {
        GameModel.getGameDataByTeamId(req.game.teamId)
        .then((data) => {
            req.game.canBuyBlocks = data.sePuedeComprarBloques;
            req.game.extraBlockPrice = data.precioBloqueExtra;
            req.game.buyTimesInCityDay = data.vecesCompraCiudadDia;
            next();
        })
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })
    }

    public static getAllGameCities (req:Request, res:Response) {
        GameModel.getAllGameCities(req.game.id)
        .then((data) => res.json({msg: 'Ciudades obtenidas', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getGameCityById (req:Request, res:Response) {
        const idCiudad = Number(req.params.cityId);
        
        GameModel.getGameCityById(req.game.id, idCiudad)
        .then((data) => res.json({msg: 'Ciudad obtenida', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getAllGameCityProducts (req:Request, res:Response) {
        const idCiudad = Number(req.params.cityId);

        GameModel.getAllGameCityProducts(req.game.id,req.game.teamId,idCiudad)
        .then((data) => res.json({msg: 'Productos obtenidos', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getGameCityProductById (req:Request, res:Response) {
        const idCiudad = Number(req.params.cityId);
        const idProducto = Number(req.params.productId);

        GameModel.getGameCityProductById(req.game.id,req.game.teamId,idCiudad,idProducto)
        .then((data) => res.json({msg: 'Producto obtenido', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getAllProducts (req:Request, res:Response) {
        GameModel.getAllProducts(req.game.id)
        .then((data) => res.json({msg: 'Productos obtenidos', data: data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    public static getProductById (req:Request, res:Response) {
        const idProducto = Number(req.params.productId);

        GameModel.getProductById(req.game.id,idProducto)
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
            productos:TradeItems[] = [],
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

        GameModel.doTrade(req.game.id,req.game.teamId,idCiudad,productos)
        .then(async (data) => {
            res.json({msg: 'Transacción realizada'});
            try {

                let diff = [];
                
                for (const p of productos) {
                    let newProduct = await GameModel.getGameCityProductById(req.game.id,req.game.teamId,idCiudad,p.idProducto,true);
                    
                    diff.push({
                        idProducto: p.idProducto,
                        precioCompra: newProduct.precioCompra,
                        precioVenta: newProduct.precioVenta,
                        stock: newProduct.stock,
                    });
                }
                
                sendCityDataNotification(req.game.id,req.user.id,{cityId:idCiudad, products:diff});
            } catch (e) {
                console.log(e);
            }
        })
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })
    }

    static getTruckInfo (req:Request, res:Response) {
        GameModel.getTruckInfo(req.game.id, req.game.teamId)
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
                    let product = await GameModel.getProductById(req.game.id,p.idProducto);

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

        GameModel.changeProductStorage(req.game.id,req.game.teamId,productos)
        .then((data) => res.json({msg: 'Carga/descarga realizada'}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })      
    }

    static getGroupRentedBlocks (req:Request, res:Response) {
        GameModel.getGroupRentedBlocks(req.game.teamId)
        .then((data) => res.json({msg: 'Datos obtenidos', data:data}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        }) 
    }

    static rentNewBlocks (req:Request, res:Response) {
        const cant = Number(req.body.cant);
        
        if (Number.isNaN(cant) || cant <= 0) {
            const x = checkError(new Error('WRONG_DATA'),{cant: 'Ingrese un valor válido'});
            return res.status(x.httpCode).json(x.body);
        }

        GameModel.rentNewBlocks(req.game.teamId,cant)
        .then((data) => res.json({msg: 'Alquiler realizado'}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        }) 
    }

    static subletBlocks (req:Request, res:Response) {
        const cant = Number(req.body.cant);

        if (Number.isNaN(cant) || cant <= 0) {
            const x = checkError(new Error('WRONG_DATA'),{cant: 'Ingrese un valor válido'});
            return res.status(x.httpCode).json(x.body);
        }

        GameModel.subletBlocks(req.game.teamId,cant)
        .then((data) => res.json({msg: 'Desalquiler realizado'}))
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        }) 
    }
}