import { Request, Response, NextFunction } from 'express'
import empty from 'is-empty'
import rut from 'rut.js'
import bcrypt from 'bcryptjs';
import Cryptr from 'cryptr';

import Token, { JwtData } from '../classes/token';

import checkError, { ErrorHandler } from '../middleware/errorHandler';

import AuthModel from '../models/auth'

export default class AuthController {
    
    private static encryptId (id:string) : string {
        const x = new Cryptr(String(process.env.CRYPTR_KEY));
        return x.encrypt(id);
    }

    private static decryptId (hash:string) : string {
        const x = new Cryptr(String(process.env.CRYPTR_KEY));
        return x.decrypt(hash);
    }
    
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

                const crypt = AuthController.encryptId(data.idUsuario);

                const tkn = Token.getJwtToken({ id: crypt });
                try {
                    await AuthModel.setLogin(data.idUsuario, req.ip, crypt);
                    return res.json({msg: 'Acceso correcto', data: {
                        token: tkn,
                        rol: data.nombreRol,
                        gameId: (data.nombreRol === "JUGADOR" ? data.idJuego : null),
                        teamId: (data.nombreRol === "JUGADOR" ? data.idGrupo : null)
                    }});
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

    static logoutUser (req: any, res: Response) {
        AuthModel.destroyTokenByUserId(req.userId)
        .then( () => res.json({msg: 'Se ha cerrado la sesión'}) )
        .catch( () => {
            const x = checkError(new Error('TOKEN_NOT_DESTROYED'));
            return res.status(x.httpCode).json(x.body);
        });
    }

    static checkAuth (req: any, res: Response, next:NextFunction) {
        const x = Token.checkJwtToken( req.header('x-token') || '' );
        
        if (x === "") {
            const x = checkError(new Error('INVALID_TOKEN'));
            return res.status(x.httpCode).json(x.body);
        }

        let userId = AuthController.decryptId((x as JwtData).id);

        AuthModel.getTokenDataByUserId(Number(userId))
        .then((data) => {
            if (data.ultimaIp == req.ip && data.tokenS === (x as JwtData).id) {
                req.userId = userId;
                next();
            } else {
                const x = checkError(new Error('INVALID_TOKEN'));
                return res.status(x.httpCode).json(x.body);
            }
        })
    }

    static renewToken (req: any, res: Response) {
        const crypt = AuthController.encryptId(req.userId);

        const tkn = Token.getJwtToken({ id: crypt });
        AuthModel.setLogin(req.userId, req.ip, crypt)
            .then((data) => {
                return res.json({msg: 'Token actualizado', token: tkn});
            })
            .catch( (err) => { 
                console.log(err);
                const x = checkError(new Error('TOKEN_UPDATE_ERROR'));
                return res.status(x.httpCode).json(x.body);
            });
    }
}