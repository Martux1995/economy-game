import { Request, Response } from 'express'
import empty from 'is-empty'
import fs from 'fs';
import path from 'path';

import DataModel from '../models/data'
import checkError from '../middleware/errorHandler'

export default class DataController {

    static getServerTime(req: Request, res: Response) {
        DataModel.getServerTime()
        .then( data => res.json({msg: 'Tiempo obtenido', data: data}))
        .catch( (err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })
    }

    static getCityImage(req: Request, res: Response) {
        const imagePath = path.resolve( __dirname, '../../images/cities',req.params.name);

        if (fs.existsSync(imagePath))
            res.sendFile(imagePath);
        else
            res.status(400).json({ok:false,msg:"Imagen no encontrada"});
    }

    /* --------------------------------------- CARRERAS --------------------------------------- */

    static getAllCarreras(req: Request, res: Response) {
        DataModel.getAllCarreras()
        .then( (data) => res.json({msg:'Carreras obtenidas', data: data}) )
        .catch( (err) => res.status(400).json({code: 1, msg: 'Error retornando los datos'}) )
    }

    static getCarreraById (req: Request, res: Response) {
        const id = Number(req.params.idCarrera);

        if (id == 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        DataModel.getCarreraById(id)
            .then( (data) => res.json({msg:'Carrera obtenida', data: data}) )
            .catch( (err:Error) => {
                if (err.message == 'CARRERA_GET_ERROR') {
                    return res.status(400).json({code: 1, msg: 'No se pudo obtener la carrera'});
                } else {
                    return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static createCarrera (req: Request, res: Response) {
        const errors:any = {};

        const nombre = req.body.nombreCarrera;

        if (empty(nombre))  errors.nombre = 'Ingrese un nombre válido';

        if (!empty(errors))
            return res.status(400).json({code: 1, msg: 'Datos incorrectos', err: errors});


        DataModel.createCarrera (nombre)
            .then( (data) => res.json({msg:'Carrera creada', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'CARRERA_DUPLICATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'El nombre de carrera ya se encuentra en el sistema'});
                    case 'CARRERA_INSERT_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo crear la carrera'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static updateCarrera (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.idCarrera);
        const nombre = req.body.nombreCarrera;

        if (empty(nombre))  errors.nombre = 'Ingrese un nombre válido';

        if (!empty(errors))
            return res.status(400).json({code: 1, msg: 'Datos incorrectos', err: errors});

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        DataModel.updateCarrera (id, nombre)
            .then( (data) => res.json({msg:'Carrera actualizada', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'CARRERA_DUPLICATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'El nombre de carrera ya se encuentra en el sistema'});
                    case 'CARRERA_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar la carrera'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    /* --------------------------------------- ROLES --------------------------------------- */

    static getAllRoles (req:Request, res:Response) {
        DataModel.getAllRoles()
            .then( (data) => res.json({msg: 'Roles retornados', data: data}) )
            .catch( (err) => res.status(400).json({code: 1, msg: 'Error retornando los datos'}));
    }

    static getRolById (req:Request, res:Response) {
        const id = Number(req.params.idRol);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});
        
        DataModel.getRolById(id)
            .then( (data) => res.json({msg: 'Rol retornado', data: data}) )
            .catch( (err) => {
                if (err.message == 'ROL_GET_ERROR') {
                    return res.status(400).json({code: 1, msg: 'No se pudo actualizar el rol'});
                } else {
                    return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }


}