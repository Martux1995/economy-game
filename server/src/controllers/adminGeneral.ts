import { Request, Response } from 'express';

import checkError from '../middleware/errorHandler';

import AdminGeneralModel from '../models/adminGeneral';
import EmailSender from '../middleware/emailSender';

export default class AdminGeneralController {

    static createAccounts (req:Request, res:Response) {
        AdminGeneralModel.createUsers()
        .then(async data => {
            const accepted:any[] = [], rejected:any[] = [];
            for (const p of data) {
                if (p.rol == "JUGADOR"){
                    const datos = {
                        playerName: `${p.nombre} ${p.apellidoP}${p.apellidoM ? ' '+p.apellidoM : ''}`,
                        teamName: p.nombreGrupo,
                        siteLink: process.env.URL,
                        password: p.claveGenerada
                    }
                    await EmailSender.sendMail(p.correoUcn,"Registro en Vendedor Viajero","newPlayerMail.html",datos)
                    .then(data => { console.log(data); accepted.push({idUsuario: p.idUsuario, correo: p.correoUcn}); })
                    .catch(err => { console.log(err); rejected.push({idUsuario: p.idUsuario, correo: p.correoUcn}); });
                    
                } else {
                    const datos = {
                        teacherName: `${p.nombre} ${p.apellidoP}${p.apellidoM ? ' '+p.apellidoM : ''}`,
                        siteLink: process.env.URL,
                        password: p.claveGenerada
                    }
                    await EmailSender.sendMail(p.correoUcn,"Registro en Vendedor Viajero","newTeacherMail.html",datos)
                    .then(data => { console.log(data); accepted.push({idUsuario: p.idUsuario, correo: p.correoUcn}); })
                    .catch(err => { console.log(err); rejected.push({idUsuario: p.idUsuario, correo: p.correoUcn}); });
                }
            }
            res.json({msg:'Cuentas creadas', data: {enviados: accepted, rechazados: rejected} })
        })
        .catch(err => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })
    }


}