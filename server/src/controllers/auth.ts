import { Request, Response, NextFunction } from 'express';
import empty from 'is-empty';
import rut from 'rut.js';

import Crypt from '../classes/crypt';
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
            if (data.nombreRol === "JUGADOR" && data.idJugadorDesignado !== data.idJugador) {
                throw new Error ("PLAYER_NOT_DESIGNATED");
            }

            if (Crypt.verifyPass(body.password, data.passHash)) {
                const idVar = Crypt.encryptVal(data.idUsuario);
                const teamVar = data.nombreRol === "JUGADOR" ? Crypt.encryptVal (data.idGrupo) : null;
                
                const tkn = Token.getJwtToken({ id: idVar, team: teamVar});
                try {
                    await AuthModel.setLogin(data.idUsuario, req.ip, idVar);
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
            console.log(err);
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

        let userId = Crypt.decryptVal((x as JwtData).id);
        let teamId = typeof (x as JwtData).team === 'string' 
                    ? Crypt.decryptVal(String((x as JwtData).team)) 
                    : null;

        AuthModel.getTokenDataByUserId(Number(userId))
        .then((data) => {
            if (data.ultimaIp == req.ip && data.tokenS === (x as JwtData).id) {
                req.userId = userId;
                req.teamId = teamId;
                next();
            } else {
                const x = checkError(new Error('INVALID_TOKEN'));
                return res.status(x.httpCode).json(x.body);
            }
        })
    }

    static renewToken (req: any, res: Response) {
        const user = Crypt.encryptVal(req.userId);
        const team = typeof req.teamId === 'string' 
                    ? Crypt.encryptVal(req.teamId) 
                    : null;

        const tkn = Token.getJwtToken({ id: user, team: team });
        AuthModel.setLogin(req.userId, req.ip, user)
            .then((data) => {
                return res.json({msg: 'Token actualizado', token: tkn});
            })
            .catch( (err) => { 
                console.log(err);
                const x = checkError(new Error('TOKEN_UPDATE_ERROR'));
                return res.status(x.httpCode).json(x.body);
            });
    }

    static isTeacher (req: any, res:Response, next:NextFunction) {
        AuthModel.getUserIsTeacher(req.userId)
        .then(() => next())
        .catch(() => {
            const x = checkError(new Error('USER_NOT_TEACHER'));
            return res.status(x.httpCode).json(x.body);
        })
    }

    static isPlayer (req: any, res: Response, next: NextFunction) {
        AuthModel.getUserIsPlayer(req.userId, req.teamId)
        .then((data) => {
            if (data.concluido){
                const x = checkError(new Error('GAME_FINISHED'));
                return res.status(x.httpCode).json(x.body);
            } else if (data.idJugador == data.idJugadorDesignado){
                next()
            } else {
                const x = checkError(new Error('PLAYER_LOGED_NOT_DESIGNATED'));
                return res.status(x.httpCode).json(x.body);
            }
        })
        .catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })
    }
}