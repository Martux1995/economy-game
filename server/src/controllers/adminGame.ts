import { Request, Response, NextFunction } from 'express';
import empty from 'is-empty';
import RUT from 'rut.js';

import Crypt from '../classes/crypt';

import checkError, { ErrorHandler } from '../middleware/errorHandler';

import { GroupData, Jugador, Producto, Grupo, Juego, StudentData } from '../interfaces/admin';

import AdminGameModel from '../models/adminGame';
import AdminGeneralModel from '../models/adminGeneral';

import ExcelJS from 'exceljs';
import path from 'path';
import DataModel from '../models/data';
import moment, { Moment } from 'moment';
import EmailSender, { MailData } from '../middleware/emailSender';
import isEmpty from 'is-empty';
import { Ciudad } from '../interfaces/game';
import rut from 'rut.js';

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

    static async getReport(req:Request, res:Response) {
        let excel = await AdminGameController.generateExcelReport(Number(req.params.gameId),req.body.generateDate);
        res.send(excel);
    }

    static async updateGameProperties () {
        const games = await AdminGameModel.getValidGames();

        const serverTime = await DataModel.getServerTime();
        const actualTime:Moment = moment(serverTime.momento);
        
        let newLeaders:Jugador[] = [];
        // Para cada juego
        for (const game of games) {

            // Cobro de los bloques extra
            const blockTime:Moment = moment(game.proxCobroBloqueExtra);
            if (blockTime < actualTime && game.freqCobroBloqueExtraDias > 0) {
                await AdminGameModel.chargeExtraBlocksCost(game);
            } else if (process.env.NODE_ENV !== "production") {
                console.log('not charge blocks yet');
            }

            // Cobro del impuesto del juego
            const taxTime:Moment = moment(game.proxCobroImpuesto);
            if (taxTime < actualTime && game.freqCobroImpuestoDias > 0) {
                await AdminGameModel.chargeTaxCost(game);
            } else if (process.env.NODE_ENV !== "production") {
                console.log('not charge tax yet');
            }

            // Generación de los reportes
            const reportTime:Moment = moment(game.proxGeneracionReporte);
            if (reportTime < actualTime && game.freqGeneracionReporteDias > 0) {
                await AdminGameModel.generateReportData(game.idJuego);
                let excelFile = await this.generateExcelReport(game.idJuego,game.proxGeneracionReporte);

                AdminGameModel.getTeachersByGameId(game.idJuego).then((data) => {
                    EmailSender.sendMail( 'teacherGroupsReport.html', "Reporte automático", { 
                        to: data.map(p => { return p.correoUcn }), 
                        attach: [{ file: excelFile, name: 'Reporte Grupal.xlsx' }] 
                    });
                });

            } else if (process.env.NODE_ENV !== "production"){
                console.log('not report generate yet');
            }

            // Cambio de los líderes
            const leaderTime:Moment = moment(game.proxRotacionLideres);
            if (leaderTime < actualTime && game.freqRotacionLideresDias > 0) {
                newLeaders = newLeaders.concat(await AdminGameModel.updateLeaderTeam(game.idJuego));
            } else if (process.env.NODE_ENV !== "production") {
                console.log('not team leader change yet');
            }
            
        }

        const mails:MailData[] = newLeaders.map(l => {
            return {
                to:l.correoUcn,
                data: {
                    playerName: `${l.nombre} ${l.apellidoP}${l.apellidoM ? ' '+l.apellidoM : ''}`
                }
            }
        });
        if (!isEmpty(mails))
            EmailSender.sendMail("newLeaderGroup.html","Nuevo lider designado",mails);
        else if (process.env.NODE_ENV !== "production")
            console.log('no leader teams mails sended');
            

        return true;
    }

    static async generateExcelReport(gameId:number, generateDate:string, groupId:number = 0) : Promise<ExcelJS.Buffer> {
        let gameData = await AdminGameModel.getGameById(gameId);
        let reportData = await AdminGameModel.getReportData(gameId,generateDate);
        let citiesData = await AdminGameModel.getCitiesByGameId(gameId);
        let productsData = await AdminGameModel.getProductsByGameId(gameId);

        const templateBook = new ExcelJS.Workbook();
        await templateBook.xlsx.readFile(path.join(__dirname,'../../reportTemplate.xlsx'));

        const reportBook = new ExcelJS.Workbook();

        reportBook.creator = 'Vendedor Viajero';
        
        
        reportData.forEach(r => {
            let tmpSheet = templateBook.getWorksheet('TEMPLATE');

            let sheet = reportBook.addWorksheet(r.nombreGrupo);

            // @ts-ignore
            sheet.model = Object.assign(tmpSheet.model, { mergeCells: tmpSheet.model.merges });

            sheet.name = r.nombreGrupo;
            
            sheet.getCell('D5').value = `${gameData.nombre} - ${gameData.semestre}`;
            sheet.getCell('D6').value = r.idGrupo;
            sheet.getCell('D7').value = r.nombreGrupo;
            sheet.getCell('D8').value = `${moment(r.fechaInicio).format('DD/MM/YYYY HH:mm:ss')} - ${moment(r.fechaFin).format('DD/MM/YYYY HH:mm:ss')}`;
            sheet.getCell('D9').value = `${r.nombrePersona} ${r.apellidoP}${r.apellidoM ? ' ' + r.apellidoM : ''}`;

            sheet.getCell('K6').value = r.saldoFinal;
            sheet.getCell('M6').value = r.bloquesExtra;

            sheet.getCell('K9').value = r.ingreso;
            sheet.getCell('L9').value = r.egreso;
            sheet.getCell('M9').value = r.utilidad;

            let rows:Array<any>[] = [];

            for (const p of productsData) {
                const row = [], sp = r.stock ? r.stock.find(s => s.idProducto == p.idProducto) : null;

                row[11] = p.nombre;
                row[12] = sp ? sp.stockBodega : 0;
                row[13] = sp ? sp.stockCamion : 0;

                rows.push(row);
            }

            let i = 0;
            if (r.transacciones) {
                for (const t of r.transacciones) {
                    for (const d of t.detalle) {
                        
                        if (i >= rows.length ) rows.push([]);
                        let cit = citiesData.find(c => c.idCiudad == t.idCiudad)
                        let pro = productsData.find(p => p.idProducto == d.idProducto)
                        rows[i][3] = moment(t.fechaIntercambio).format('DD/MM/YYYY HH:mm:ss');
                        rows[i][4] = cit ? cit.nombreCiudad : '';
                        rows[i][5] = pro ? pro.nombre : '';
                        rows[i][6] = d.esCompra;
                        rows[i][7] = d.cantidad;
                        rows[i][8] = d.precioUnitario;
                        rows[i][9] = d.precioUnitario * d.cantidad;
                        i++;
                    }
                }
            }

            let rowPos = 14; i = 0;          
            for (i = 0; i < rows.length; i++) {
                for (let j = 2; j <= 14; j++) {
                    let c = sheet.getRow(rowPos + i).getCell(j);
                    if (rows[i][j] == null) {
                        c.style.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: {argb: 'FFB8CCE4'}
                        }
                        
                        if (j == 2) c.style.border = { left: { style: 'medium' }}
                        if (j == 14) c.style.border = { right: { style: 'medium' }}

                    } else {
                        c.value = rows[i][j];
                        c.style = {
                            border: {
                                bottom: { style: 'thin' },
                                left: { style: 'thin' },
                                top: { style: 'thin' },
                                right: { style: 'thin' }
                            },
                            fill: {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: {argb: '00FFFFFF'}
                            }
                        }
                    }
                    
                }
            }
            
            for (let j = 2; j <= 14; j++) {
                let c = sheet.getRow(rowPos + i).getCell(j);
                c.style.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {argb: 'FFB8CCE4'}
                }
                c.style.border = {
                    bottom: { style: 'medium' }
                }
                if (j == 2) c.style.border.left = { style: 'medium' }
                if (j == 14) c.style.border.right = { style: 'medium' }
                
            }
        });
        return await reportBook.xlsx.writeBuffer();
    }

    static getGroupsByGameId(req: Request, res: Response) {
        const id = Number(req.params.gameId);

        if (id == 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});   

        AdminGameModel.getGroupsByGameId(id)
        .then( (data) => res.json({msg:'Datos de los Grupos Obtenidos', data: data}) )
        .catch( (err:Error) => {
            if (err.message == 'GROUP_GET_ERROR') {
                return res.status(400).json({code: 1, msg: 'No se pudo obtener los datos de los grupos'});
            } else {
                return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
            }
        });
    }

    static getCitiesByGameId(req: Request, res: Response) {
        const id = Number(req.params.gameId);

        if (id == 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});
            
        AdminGameModel.getCitiesByGameId(id)
        .then( (data) => res.json({msg:'Datos de las Ciudades Obtenidas', data: data}) )
        .catch( (err:Error) => {
            if (err.message == 'CITIES_GET_ERROR') {
                return res.status(400).json({code: 1, msg: 'No se pudo obtener los datos de las ciudades'});
            } else {
                return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
            }
        });
    }

    static getProductsByGameId(req: Request, res: Response) {
        const id = Number(req.params.gameId);

        if (id == 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'}); 

        AdminGameModel.getProductsByGameId(id)
        .then( (data) => res.json({msg:'Datos de Productos Obtenidos', data: data}) )
        .catch( (err:Error) => {
            if (err.message == 'PRODUCTS_GET_ERROR') {
                return res.status(400).json({code: 1, msg: 'No se pudo obtener los datos de los productos'});
            } else {
                return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
            }
        });
    }

    // static getRecordByGameId(req: Request, res: Response) {
    //     const id = Number(req.params.gameId);

    //     if (id == 0 || Number.isNaN(id))
    //         return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});
            
    //     AdminGameModel.getDataGameById(id)
    //     .then( (data) => res.json({msg:'Datos del Historial Obtenidos', data: data}) )
    //     .catch( (err:Error) => {
    //         if (err.message == 'RECORD_GET_ERROR') {
    //             return res.status(400).json({code: 1, msg: 'No se pudo obtener los datos del Historial'});
    //         } else {
    //             return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
    //         }
    //     });
    // }

    static desactivatePlayerByGame (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.playerId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGameModel.desactivatePlayerByGame (id)
            .then( (data) => res.json({msg:'Jugador Desactivado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'PLAYER_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar el Jugador'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static activatePlayerByGame (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.playerId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGameModel.activatePlayerByGame (id)
            .then( (data) => res.json({msg:'Jugador Activado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'PLAYER_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar el Jugador'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static desactivateGroupByGame (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.groupId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGameModel.desactivateGroupByGame (id)
            .then( (data) => res.json({msg:'Grupo Desactivado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'GROUP_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar el Grupo'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static activateGroupByGame (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.groupId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGameModel.activateGroupByGame (id)
            .then( (data) => res.json({msg:'Grupo Activado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'GROUP_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar el Grupo'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static desactivateCityByGame (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.cityId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGameModel.desactivateCityByGame (id)
            .then( (data) => res.json({msg:'Ciudad Desactivada', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'CITY_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar la Ciudad'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static activateCityByGame (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.cityId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGameModel.activateCityByGame (id)
            .then( (data) => res.json({msg:'Ciudad Activada', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'CITY_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar la Ciudad'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static desactivateProductByGame (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.productId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGameModel.desactivateProductByGame (id)
            .then( (data) => res.json({msg:'Producto Desactivado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'PRODUCT_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar el producto'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static activateProductByGame (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.productId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGameModel.activateProductByGame (id)
            .then( (data) => res.json({msg:'Producto Activado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'PRODUCT_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar el Producto'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static createCity (req: Request, res: Response) {
        
        const id = Number(req.params.gameId);
        let cityData: Ciudad;

        const errors:any = {};

        if (empty(req.body.nombreCiudad))   errors.nombreCiudad = 'Ingrese nombre de la ciudad';
        if (empty(req.body.horaAbre))       errors.horaAbre = 'Ingrese la hora de apertura de la ciudad';
        if (empty(req.body.horaCierre))     errors.horaCierre = 'Ingrese la hora de cierre de la ciudad';
        if (empty(req.body.idProfesor))     errors.idProfesor = 'Seleccione un profesor';

        if (!empty(req.body.horaAbre) && !empty(req.body.horaCierre) && moment(req.body.horaAbre,'HH:mm:ss') > moment(req.body.horaCierre,'HH:mm:ss'))
        errors.horaAbre = errors.horaCierre = 'La hora de apertura no puede ser mayor que la hora de cierre';

        if (!empty(errors)) {
            let x = checkError(Error('WRONG_DATA'),errors);
            return res.status(x.httpCode).json(x.body);
        }

        cityData = req.body;

        AdminGameModel.createCity (cityData, id)
            .then( (data) => res.json({msg:'Ciudad creada', data: data}) )
            .catch( (err:Error) => {
                let x = checkError(err);
                return res.status(x.httpCode).json(x.body);
            });
    }

    static createProduct (req: Request, res: Response) {
        
        const id = Number(req.params.gameId);
        let productData: Producto;

        const errors:any = {};

        if (empty(req.body.nombre))   errors.nombre = 'Ingrese nombre del Producto';
        if (empty(req.body.bloquesTotal))       errors.bloquesTotal = 'Ingrese la cantidad de bloques total';
        if (req.body.bloquesTotal <= 0 || Number.isNaN(req.body.bloquesTotal))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        if (!empty(errors)) {
            let x = checkError(Error('WRONG_DATA'),errors);
            return res.status(x.httpCode).json(x.body);
        }

        productData = req.body;

        AdminGameModel.createProduct (productData, id)
            .then( (data) => res.json({msg:'Producto creado con éxito', data: data}) )
            .catch( (err:Error) => {
                let x = checkError(err);
                return res.status(x.httpCode).json(x.body);
            });
    }

    static createGroup (req: Request, res: Response) {
        
        const id = Number(req.params.gameId);
        let groupData: Grupo;

        const errors:any = {};

        if (empty(req.body.nombreGrupo))   errors.nombreGrupo = 'Ingrese nombre del Grupo';
        if (empty(req.body.dineroActual))   errors.dineroActual = 'Ingrese un monto de dinero Actual';
        if (req.body.dineroActual <= 0 || Number.isNaN(req.body.dineroActual))
            return res.status(400).json({code: 1, msg:'El valor de dinero actual entregado es inválido'});

        if (!empty(errors)) {
            let x = checkError(Error('WRONG_DATA'),errors);
            return res.status(x.httpCode).json(x.body);
        }

        groupData = req.body;

        AdminGameModel.createGroup (groupData, id)
            .then( (data) => res.json({msg:'Grupo creado con éxito', data: data}) )
            .catch( (err:Error) => {
                let x = checkError(err);
                return res.status(x.httpCode).json(x.body);
            });
    }

    static async createNewGame (req: Request, res: Response) {

        let gameData: Juego;

        const error:any = {};

        if (empty(req.body.nombre))             error.nombre = 'Ingrese el nombre del Juego';
        if (empty(req.body.semestre))           error.semestre = 'Ingrese el semestre válido';
        if (empty(req.body.fechaInicio))        error.fechaInicio = 'Ingrese la fecha de inicio del juego';

        if (!empty(error)){
            let x = checkError(Error('WRONG_DATA'),error);
            return res.status(x.httpCode).json(x.body);
        }
        gameData = req.body;

        AdminGameModel.createNewGame(gameData)
        .then( (data) => res.json({msg: 'Juego Creado.', data: data}) )
        .catch((err:Error) => {
            let x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    static async updateDataGame (req: Request, res: Response) {

        const id = Number(req.params.gameId);
        let gameData: Juego;

        const error:any = {};

        if (id <= 0 || Number.isNaN(id))        error.id = 'Valor entregado inválido para actualizar';
        if (empty(req.body.nombre))             error.nombre = 'Ingrese el nombre del Juego';
        if (empty(req.body.semestre))           error.semestre = 'Ingrese el semestre válido';
        if (empty(req.body.fechaInicio))        error.fechaInicio = 'Ingrese la fecha de inicio del juego';

        if (!empty(error))
            return res.status(400).json({code: 1, msg: 'Datos incorrectos', err: error});
        
        gameData = req.body;

        AdminGameModel.updateDataGame(id, gameData)
        .then( () => res.json({msg: 'Datos del Juego actualizados.'}) )
        .catch((err:Error) => {
            let x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    static async updateDataConfiguration (req: Request, res: Response) {

        const id = Number(req.params.gameId);
        let gameData: Juego;

        const error:any = {};

        if (id <= 0 || Number.isNaN(id))        error.id = 'Valor entregado inválido para actualizar';
        if (empty(req.body.dineroInicial))             error.dineroInicial = 'Ingrese el valor de dinero inicial';
        if (empty(req.body.vecesCompraCiudadDia))      error.vecesCompraCiudadDia = 'Ingrese cantidad valida de comprar por ciudad';
        if (empty(req.body.sePuedeComerciar))          error.sePuedeComerciar = 'Ingrese si se puede comerciar';
        if (empty(req.body.sePuedeComprarBloques))     error.sePuedeComprarBloques = 'Ingrese si se puede comprar';
        if (empty(req.body.maxBloquesCamion))          error.maxBloquesCamion = 'Ingrese cantidad máxima de bloques del camion';
        if (empty(req.body.maxBloquesBodega))          error.maxBloquesBodega = 'Ingrese cantidad máxima de bloques en bodega ';
        if (empty(req.body.precioBloqueExtra))         error.precioBloqueExtra = 'Ingrese el precio de bloque extra';
        if (empty(req.body.freqCobroBloqueExtraDias))  error.freqCobroBloqueExtraDias = 'Ingrese frecuencia de cobro de bloques extra';
        if (empty(req.body.proxCobroBloqueExtra))      error.proxCobroBloqueExtra = 'Ingrese la fecha del proximo cobro';
        if (empty(req.body.valorImpuesto))             error.valorImpuesto = 'Ingrese valor del impuesto';
        if (empty(req.body.freqCobroImpuestoDias))     error.freqCobroImpuestoDias = 'Ingrese frecuencia cobro de immpuesto';
        if (empty(req.body.proxCobroImpuesto))         error.proxCobroImpuesto = 'Ingrese fecha del próximo cobro de impuesto';
        if (empty(req.body.freqRotacionLideresDias))   error.freqRotacionLideresDias = 'Ingrese frecuencia rotación de líderes';
        if (empty(req.body.proxRotacionLideres))       error.proxRotacionLideres = 'Ingrese fecha próxima rotación de lideres';
        if (empty(req.body.freqGeneracionReporteDias)) error.freqGeneracionReporteDias = 'Ingrese frecuencia de generación de reportes';
        if (empty(req.body.proxGeneracionReporte))       error.proxGeneracionReporte = 'Ingrese fecha próxima generación de reportes';

        if (!empty(error))
            return res.status(400).json({code: 1, msg: 'Datos incorrectos, verifique que están todos los campos completados', err: error});
        
        gameData = req.body;

        AdminGameModel.updateDataConfiguration(id, gameData)
        .then( (data) => res.json({msg: 'Datos de la Configuración del Juego actualizados.', data: data}) )
        .catch((err:Error) => {
            let x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    static finishGameById (req: Request, res: Response) {

        const id = Number(req.params.gameId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGameModel.finishGameById (id)
            .then( (data) => res.json({msg:'Juego Finalizado'}) )
            .catch( (err:Error) => {
                let x = checkError(err);
                return res.status(x.httpCode).json(x.body);
            });
    }

    static beginGameById (req: Request, res: Response) {

        const id = Number(req.params.gameId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGameModel.beginGameById (id)
            .then( (data) => res.json({msg:'Juego Iniciado'}) )
            .catch( (err:Error) => {
                let x = checkError(err);
                return res.status(x.httpCode).json(x.body);
            });
    }

    static getAllStudentsNotPlayer(req: Request, res: Response) {
        const id = Number(req.params.gameId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});
        AdminGameModel.getAllStudentsNotPlayer(id)
        .then( (data) => res.json({msg:'Alumnos obtenidos', data: data}) )
        .catch( (err) => res.status(400).json({code: 1, msg: 'Error retornando los datos'}) )
    }

    static async createStudentPlayer (req: Request, res: Response) {

        const idJuego = Number(req.params.gameId);
        const idAlumno = Number(req.params.studentId);

        if (idJuego <= 0 || Number.isNaN(idJuego) || idAlumno <= 0 || Number.isNaN(idAlumno))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGameModel.createStudentPlayer(idJuego, idAlumno)
        .then( () => res.json({msg: 'Jugador Creado exitosamente.'}) )
        .catch((err:Error) => {
            let x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    static async createNewPlayer (req: Request, res: Response) {

        let stdData: StudentData;

        const idJuego = Number(req.params.gameId);

        if (idJuego <= 0 || Number.isNaN(idJuego))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});
        
        const studErr:any = {};

        if (empty(req.body.nombres))             studErr.nombres = 'Ingrese los nombres del estudiante';
        if (empty(req.body.apellidoP))           studErr.apellidoP = 'Ingrese el apellido paterno';
        if (empty(req.body.apellidoM))           req.body.apellidoM = null;
        if (empty(req.body.rut))                 studErr.rut = 'Ingrese el RUT del estudiante';
        else if (!rut.validate(req.body.rut))    studErr.rut = 'El RUT ingresado no es válido';
        else await AdminGeneralModel.getPersonDataByRut(rut.format(req.body.rut))
            .then(() => studErr.rut = 'El rut ya está registrado en el sistema')
            .catch(() => {});

        if (empty(req.body.correo))              studErr.correo = 'Ingrese el correo del estudiante';
        else await AdminGeneralModel.getPersonDataByEmail(req.body.correo)
            .then(() => studErr.correo = 'El correo ya está registrado para otro estudiante')
            .catch(() => {});
            
        if (empty(req.body.idCarrera))           studErr.idCarrera = 'Seleccione Carrera';         

        if (!empty(studErr))
            return res.status(400).json({code: 1, msg: 'Datos incorrectos', err: studErr});
        
        req.body.rut = rut.format(req.body.rut); // formatea el rut antes de ser enviado a la query
        stdData = req.body;

        AdminGameModel.createNewPlayer(idJuego, stdData, req.body.idCarrera)
        .then( () => res.json({msg: 'Jugador Creado exitosamente.'}) )
        .catch((err:Error) => {
            let x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

    static addPlayerToGroup (req: Request, res: Response) {

        const idJuego = Number(req.params.gameId);
        const idGrupo = Number(req.params.groupId);
        const idJugador = Number(req.params.playerId);


        if (idJuego <= 0 || Number.isNaN(idJuego) || idGrupo <= 0 || Number.isNaN(idGrupo) || idJugador <= 0 || Number.isNaN(idJugador))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGameModel.addPlayerToGroup (idJuego, idGrupo, idJugador)
            .then( (data) => res.json({msg:'Jugador Asignado correctamente'}) )
            .catch( (err:Error) => {
                let x = checkError(err);
                return res.status(x.httpCode).json(x.body);
            });
    }
}