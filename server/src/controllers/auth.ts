import { Request, Response, NextFunction } from 'express'
import empty from 'is-empty'
import rut from 'rut.js'
import bcrypt from 'bcryptjs';

import Token, { JwtData } from '../classes/token';

import checkError, { ErrorHandler } from '../middleware/errorHandler';

import AuthModel from '../models/auth'

export default class AuthController {

    static loginUser (req: Request, res: Response) {
        const body:any = req.body, errors:any = {};
        
        if (empty(body.rut) || !rut.validate(body.rut))     errors.rut = 'El rut ingresado es inválido';
        
        if (empty(body.password))                           errors.password = 'Ingrese su contraseña';

        if (empty(body.isTeacher))                          errors.isTeacher = 'Indique si el que ingresa es profesor o alumno UCN';
        else if (!body.isTeacher && empty(body.teamname))   errors.teamname = 'Ingrese el nombre del equipo';

        if (!empty(errors)) {
            const x = checkError(new Error('WRONG_DATA'),errors);
            return res.status(x.httpCode).json(x.body);
        }

        AuthModel.getLoginData(rut.format(body.rut), body.isTeacher ? '' : body.teamname)
        .then(async (data) => {
            if (bcrypt.compareSync(body.password, data.passHash)) {
                const tkn = Token.getJwtToken({ id: data.idUsuario });
                try {
                    await AuthModel.setLogin(data.idUsuario, req.ip);
                    return res.json({code: 0, msg: 'Acceso correcto', token: tkn});
                } catch (error) {
                    throw new Error ("UPDATE_LOGIN_FAILED");
                }
            } else {
                throw new Error ("LOGIN_FAILED");
            }
        })
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });

    }

    static logoutUser (req: Request, res: Response) {
        return res.json({code: 0, msg: 'Se ha cerrado la sesión'});
    }

    static checkAuth (req: any, res: Response, next:NextFunction) {
        const x = Token.checkJwtToken( req.header('x-token') || '' );
        
        if (x === "") {
            const x = checkError(new Error('INVALID_TOKEN'));
            return res.status(x.httpCode).json(x.body);
        }

        AuthModel.getTokenDataByUserId((x as JwtData).id)
        .then((data) => {
            if (data.ultimaIp == req.ip) {
                req.usuario = (x as JwtData).id;
                next();
            } else {
                const x = checkError(new Error('INVALID_TOKEN'));
                return res.status(x.httpCode).json(x.body);
            }
        })
    }

    static renewToken (req: any, res: Response) {
        const tkn = Token.getJwtToken({ id: req.usuario });
        AuthModel.setLogin(req.usuario, req.ip)
            .then( data => {
                return res.json({code: 0, msg: 'Token actualizado', token: tkn});
            })
            .catch( err => {
                const x = checkError(err);
                return res.status(x.httpCode).json(x.body);
            });
    }
}