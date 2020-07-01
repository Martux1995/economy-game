import { Request, Response, NextFunction } from 'express';
import empty from 'is-empty';
import RUT from 'rut.js';

import Crypt from '../classes/crypt';

import checkError, { ErrorHandler } from '../middleware/errorHandler';

import { GroupData, Jugador } from '../interfaces/admin';

import AdminGameModel from '../models/adminGame';
import AdminGeneralModel from '../models/adminGeneral';

import ExcelJS from 'exceljs';
import path from 'path';
import DataModel from '../models/data';
import moment, { Moment } from 'moment';
import EmailSender, { MailData } from '../middleware/emailSender';
import isEmpty from 'is-empty';

import ZIP from 'adm-zip';
import ExcelGenerator from '../middleware/excelGenerator';

export default class AdminGameController {

//     static async addNewGroups (req:Request, res:Response) {
//         let gData:GroupData | GroupData[];
//         if (req.body instanceof Array) {
// // 
//             const errors:GroupData[] = [];
//             let i = 0;
//             let rutsUnicos:string[] = [];
//             for (const gr of req.body) {
//                 const grErrors:GroupData = {};
// // 
//                 if (empty(gr.nombreGrupo))      grErrors.nombreGrupo = 'Ingrese un nombre de grupo.';
//                 else await AdminGameModel.getGroupByName(Number(req.params.gameId),gr.nombreGrupo)
//                     .then(() => grErrors.nombreGrupo = 'El nombre del grupo ya existe en este juego.')
//                     .catch(() => {});
// // 
//                 let bueno = true;
//                 let rutError = [];
//                 // 
//                 for (const rut of gr.ruts) {
//                     if (!RUT.validate(rut)) {
//                         rutError.push('El RUT ingresado no es válido'); bueno = false;
//                     } else {
//                         await AdminGameModel.getPlayerByRut(Number(req.params.gameId),rut.format(rut))
//                         .then( () => {
//                             rutError.push('El jugador ya está en otro equipo'); bueno = false;
//                         }).catch( () => AdminGeneralModel.getPersonDataByRut(rut.format(rut)) )
//                         .then( () => { 
//                             if(rutsUnicos.find(rut.format(rut))) {
//                                 rutError.push('RUT duplicado en otro grupo'); bueno = false;
//                             } else {
//                                 rutsUnicos.push(rut.format(rut));
//                                 rutError.push('');
//                             }
//                         }).catch( () => {rutError.push('El rut no existe en el sistema'); bueno = false } );
//                     }
//                 }
// // 
//                 if (!empty(grErrors)) {  grErrors.id = i; errors.push(grErrors); }
//                 i++;
//             }
// // 
//             if (!empty(errors)) {
//                 let x = checkError(Error('WRONG_DATA'),errors);
//                 return res.status(x.httpCode).json(x.body);
//             }
// // 
//             gData = req.body;
// // 
//         } else {
//             gData = {};
//         }
// // 
//         AdminGameModel.addNewGroups(Number(req.params.gameId),gData)
//         .then( (data) => {
// // 
//             return res.json({msg: 'Grupos ingresados.'})
//         })
//         .catch((err:Error) => {
//             let x = checkError(err);
//             return res.status(x.httpCode).json(x.body);
//         });
//     }

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
        //let excel = await AdminGameController.generateExcelReport(Number(req.params.gameId),req.body.generateDate);
        
        let excel = await ExcelGenerator.generateTestWB();

        let compressed = new ZIP();

        compressed.addFile('reporte.xlsx',Buffer.from(excel));

        res.set('Content-Type', 'application/zip');
        res.send(compressed.toBuffer());
    }

    static async getAllGroupExcelReport(req:Request, res:Response) {
        
        let zipFile = new ZIP();
        let groups = await AdminGameModel.getGroupsByGameId(Number(req.params.gameId));

        try {
            if (groups.length > 0) {
                for (const g of groups) {
                    let excel = await ExcelGenerator.makeGroupReport(g.idJuego,g.idGrupo);
                    zipFile.addFile(`${g.idGrupo}-${g.nombreGrupo}.xlsx`,Buffer.from(excel));
                }
                res.set('Content-Type','application/zip').send(zipFile.toBuffer());
            } else {
                return res.status(400).json({code:1, msg: 'No hay grupos en el juego o el juego no existe'});
            }
        } catch (e) {
            console.log(e);
            return res.status(500).json({msg: e.message});
        }
    }

    static async sendAllGroupExcelReport(req:Request, res:Response) {
        let groups = await AdminGameModel.getGroupsByGameId(Number(req.params.gameId));
        try {
            if (groups.length > 0) {
                for (const g of groups) {
                    let excel = await ExcelGenerator.makeGroupReport(g.idJuego,g.idGrupo);
                    const leader = await AdminGameModel.getPlayerById(g.idJuego,Number(g.idJugadorDesignado));

                    EmailSender.sendMail( 'playerGroupsReport.html', "Reporte de estado actual", { 
                        to: leader.correoUcn,
                        data: {
                            playerName: `${leader.nombre} ${leader.apellidoP}${leader.apellidoM ? ' ' + leader.apellidoM : ''}`,
                            teamName: leader.nombreGrupo
                        },
                        attach: [{ file: excel, name: `${g.nombreGrupo}.xlsx` }] 
                    });
                }
                res.json({msg: 'Enviando mensajes...' });
            } else {
                return res.status(400).json({code:1, msg: 'No hay grupos en el juego o el juego no existe'});
            }
        } catch (e) {
            console.log(e);
            return res.status(500).json({msg: e.message});
        }
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

    
}