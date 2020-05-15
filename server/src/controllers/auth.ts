import { Request, Response, NextFunction } from 'express';
import empty from 'is-empty';
import rut from 'rut.js';

import Crypt from '../classes/crypt';
import Token, { JwtData } from '../classes/token';

import checkError from '../middleware/errorHandler';

import AuthModel from '../models/auth'

export default class AuthController {
    
    // PERMITE INICIAR LA SESIÓN Y RETORNAR EL TOKEN
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

            if (data.nombreRol === "JUGADOR" && data.juegoConcluido) {
                throw new Error ("GAME_CLOSED");
            }

            if (Crypt.verifyPass(body.password, data.passHash)) {
                const idVar = Crypt.encryptVal(data.idUsuario);
                const teamVar = data.nombreRol === "JUGADOR" ? Crypt.encryptVal (String(data.idGrupo)) : null;
                
                const tkn = Token.getJwtToken({ id: idVar, team: teamVar});
                try {
                    await AuthModel.setLogin(data.idUsuario, req.ip, idVar);
                    return res.json({msg: 'Acceso correcto', data: {
                        token: tkn,
                        rol: data.nombreRol,
                        userName: `${data.nombre} ${data.apellidoP}${data.apellidoM ? ` ${data.apellidoM}` : ''}`,
                        teamName: (data.nombreRol === "JUGADOR" ? data.nombreGrupo : null)
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

    // PERMITE COMPROBAR SI EL TOKEN DEL USUARIO ES VÁLIDO O NO
    static checkAuth (req: Request, res: Response, next:NextFunction) {
        const x = Token.checkJwtToken( req.header('x-token') || '' );
        
        if (x === "") {
            const x = checkError(new Error('INVALID_TOKEN'));
            return res.status(x.httpCode).json(x.body);
        }

        let userId = Crypt.decryptVal((x as JwtData).id);
        let teamId = typeof (x as JwtData).team === 'string' 
                    ? Crypt.decryptVal(String((x as JwtData).team)) 
                    : null;

        AuthModel.getTokenData(Number(userId),Number(teamId))
        .then((data) => {
            
            if (data.nombreRol === "JUGADOR" && data.idJugadorDesignado !== data.idJugador) {
                throw new Error ("PLAYER_NOT_DESIGNATED");
            }
            if (data.nombreRol === "JUGADOR" && data.juegoConcluido) {
                throw new Error ("GAME_CLOSED");
            }

            if (data.ultimaIp == req.ip && data.tokenS === (x as JwtData).id) {
                req.user = {
                    id: Number(userId),
                    rolId: data.idRol,
                    rolName: data.nombreRol
                }
                req.game = {
                    id: Number(data.idJuego),
                    teamId: Number(teamId)
                }
                next();
            } else {
                throw new Error ('INVALID_TOKEN');
            }
        }).catch((err:Error) => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })
    }

    // PERMITE SABER SI EL USUARIO ES ADMINISTRADOR, Y ASÍ ACCEDER A LA FUNCIONALIDAD SOLICITADA
    static isAdmin (req: Request, res: Response, next: NextFunction) {
        if (req.user.rolName === 'ADMINISTRADOR' || req.user.rolId === 1)
            next();
        else {
            const x = checkError(new Error('USER_NOT_ADMIN'));
            return res.status(x.httpCode).json(x.body);
        }
    }
    
    // PERMITE SABER SI EL USUARIO ES PROFESOR, Y ASÍ ACCEDER A LA FUNCIONALIDAD SOLICITADA
    static isTeacher (req: Request, res:Response, next:NextFunction) {
        if (req.user.rolName === 'PROFESOR' || req.user.rolId === 2)
            next();
        else {
            const x = checkError(new Error('USER_NOT_TEACHER'));
            return res.status(x.httpCode).json(x.body);
        }
    }

    // PERMITE SABER SI EL USUARIO ES JUGADOR, Y ASÍ ACCEDER A LA FUNCIONALIDAD SOLICITADA
    static isPlayer (req: Request, res: Response, next: NextFunction) {
        if (req.user.rolName === 'JUGADOR' || req.user.rolId === 3)
            next();
        else {
            const x = checkError(new Error('USER_NOT_PLAYER'));
            return res.status(x.httpCode).json(x.body);
        }
    }

    // PERMITE AL USUARIO SALIR DEL SISTEMA
    static logoutUser (req: Request, res: Response) {
        AuthModel.destroyTokenByUserId(req.user.id)
        .then( () => res.json({msg: 'Se ha cerrado la sesión'}) )
        .catch( () => {
            const x = checkError(new Error('TOKEN_NOT_DESTROYED'));
            return res.status(x.httpCode).json(x.body);
        });
    }

    // PERMITE AL USUARIO RENOVAR EL TOKEN
    static renewToken (req: Request, res: Response) {
        const user = Crypt.encryptVal(req.user.id);
        const team = req.game.teamId != 0 ? Crypt.encryptVal(req.game.teamId) : null;

        const tkn = Token.getJwtToken({ id: user, team: team });

        AuthModel.getTokenData(req.user.id,req.game.teamId)
        .then(async (data) => {
            await AuthModel.setLogin(data.idUsuario, req.ip, user);

            return res.json({msg: 'Token actualizado', data: { 
                token: tkn,
                rol: data.nombreRol,
                userName: `${data.nombre} ${data.apellidoP}${data.apellidoM ? ` ${data.apellidoM}` : ''}`,
                teamName: (data.nombreRol === "JUGADOR" ? data.nombreGrupo : null)
            } });
        })
        .catch( (err) => { 
            console.log(err);
            const x = checkError(new Error('TOKEN_UPDATE_ERROR'));
            return res.status(x.httpCode).json(x.body);
        });
    }
}