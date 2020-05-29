import e, { Request, Response } from 'express'
import empty from 'is-empty'
// import moment from 'moment';

import { sendCityDataNotification } from '../middleware/webSocket';

import checkError from '../middleware/errorHandler';

import TeacherModel from '../models/teacher';
import { CiudadUpdateData, ProductUpdateData } from '../interfaces/game';
import moment from 'moment';
// import { TradeItems } from '../interfaces/game';

export default class TeacherController {

    static getGames (req:Request, res:Response) {
        TeacherModel.getGames(req.user.personId)
        .then(data => res.json({msg: 'Datos recuperados', data:data}))
        .catch(err => {
            let x = checkError(err);
            res.status(x.httpCode).json(x.body);
        });
    }

    static getGameData (req:Request, res:Response) {
        TeacherModel.getGameData(req.user.personId,Number(req.params.gameId))
        .then(data => res.json({msg: 'Datos recuperados', data:data}))
        .catch(err => {
            let x = checkError(err);
            res.status(x.httpCode).json(x.body);
        });
    }

    static getCities (req:Request, res:Response) {
        TeacherModel.getCities(req.user.personId)
        .then(data => res.json({msg: 'Datos recuperados', data:data}))
        .catch(err => {
            let x = checkError(err);
            res.status(x.httpCode).json(x.body);
        });
    }

    static getCityDataById (req:Request, res:Response) {
        TeacherModel.getCityDataById(req.user.personId,Number(req.params.cityId))
        .then(data => res.json({msg: 'Datos recuperados', data:data}))
        .catch(err => {
            let x = checkError(err);
            res.status(x.httpCode).json(x.body);
        });
    }

    static updateCityData (req:Request, res:Response) { 
        const cityId:number = Number(req.params.cityId);
        const data:CiudadUpdateData = req.body, errors:any = {};

        if (empty(data.descripcion))    errors.descripcion = 'Agregue una descripción a la ciudad';
        if (empty(data.nombreCiudad))   errors.nombreCiudad = 'Ingrese el nombre de la ciudad';
        if (empty(data.horaAbre))       errors.horaAbre = 'Ingrese la hora de apertura de la ciudad';
        if (empty(data.horaCierre))     errors.horaCierre = 'Ingrese la hora de cierre de la ciudad';

        if (!empty(data.horaAbre) && !empty(data.horaCierre) && moment(data.horaAbre,'HH:mm:ss') > moment(data.horaCierre,'HH:mm:ss'))
            errors.horaAbre = errors.horaCierre = 'La hora de apertura no puede ser mayor que la hora de cierre';
        
        if (!empty(errors)) {
            let x = checkError(Error('WRONG_DATA'),errors);
            return res.status(x.httpCode).json(x.body);
        }

        TeacherModel.updateCityData(Number(req.user.personId),cityId,data)
        .then(data => res.json({msg: 'Ciudad actualizada'}))
        .catch((err:Error) => {
            let x = checkError(err);
            res.status(x.httpCode).json(x.body);
        });
    }

    static getCityProducts (req:Request, res:Response) {
        TeacherModel.getCityProducts(req.user.personId,Number(req.params.cityId))
        .then(data => res.json({msg: 'Datos recuperados', data:data}))
        .catch(err => {
            let x = checkError(err);
            res.status(x.httpCode).json(x.body);
        });
    }

    static updateProduct (req:Request, res:Response) {
        const cityId:number = Number(req.params.cityId);
        const teacherId:number = Number(req.user.personId);
        const data:ProductUpdateData[] = req.body, errors:{}[] = [];

        data.forEach(async p => {
            const pErr:any = {};

            try {
                await TeacherModel.getCityProductById(Number(req.user.personId),cityId,p.idProducto);
            } catch (e) {
                errors.push({id: p.idProducto, idProducto: 'El id del producto es inválido'});
                return;
            }

            if (empty(p.stockActual))           pErr.stockActual = 'Ingrese el stock actual';
            else if ( Number.isNaN(Number(p.stockActual)) || Number(p.stockActual) < 0)
                pErr.stockActual = 'El stock actual ingresado es negativo o inválido';

            if (empty(p.stockMax))              pErr.stockMax = 'Ingrese el stock máximo';
            else if ( Number.isNaN(Number(p.stockMax)) || Number(p.stockMax) < 0)
                pErr.stockMax = 'El stock máximo ingresado es negativo o inválido';

            if (empty(p.precioMax))             pErr.precioMax = 'Ingrese el precio máximo';
            else if ( Number.isNaN(Number(p.precioMax)) || Number(p.precioMax) < 0)
                pErr.precioMax = 'El precio máximo ingresado es negativo o inválido';

            if (empty(p.precioMin))             pErr.precioMin = 'Ingrese el precio mínimo';
            else if ( Number.isNaN(Number(p.precioMin)) || Number(p.precioMin) < 0)
                pErr.precioMin = 'El precio mínimo ingresado es negativo o inválido';
                
            if (empty(p.factorVenta))           pErr.factorVenta = 'Ingrese el factor de venta';
            else if ( Number.isNaN(Number(p.factorVenta)) || Number(p.factorVenta) < 0)
                pErr.factorVenta = 'El factor de venta ingresado es negativo o inválido';

            if (!empty(pErr)) { pErr.id = p.idProducto; errors.push(pErr); }
        });

        if (!empty(errors)) {
            let x = checkError(Error('WRONG_DATA'),errors);
            return res.status(x.httpCode).json(x.body);
        }

        TeacherModel.updateProducts(teacherId,cityId,data)
        .then(async data => {
            res.json({msg: 'Productos actualizados'});
            let gameId = (await TeacherModel.getCityDataById(teacherId,cityId)).idJuego;

            let products = await TeacherModel.getCityProducts(teacherId,cityId);

            sendCityDataNotification(gameId,Number(req.user.id),{
                cityId: cityId, 
                products: products.map(p => {
                    return {
                        idProducto: p.idProducto,
                        precioCompra: p.precioCompra,
                        precioVenta: p.precioVenta,
                        stock: p.stockActual
                    }
                })
            });
        })
        .catch(err => {
            let x = checkError(err);
            res.status(x.httpCode).json(x.body);
        });

    }

}