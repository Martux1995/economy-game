import { Request, Response } from 'express';
import empty from 'is-empty';
import rut from 'rut.js';

import checkError, { ErrorHandler } from '../middleware/errorHandler';
import EmailSender from '../middleware/emailSender';

import AdminGeneralModel from '../models/adminGeneral';

import { StudentData } from '../interfaces/admin';


export default class AdminGeneralController {

    static async addNewStudents(req:Request, res:Response) {

        let stdData:StudentData[] | StudentData;

        if (req.body instanceof Array) {
            // Vienen varios
            const errors:StudentData[] = [];
            let i = 0;
            for (const student of req.body) {
                const studErr:StudentData = {};

                if (empty(student.nombres))             studErr.nombres = 'Ingrese los nombres del estudiante';
                if (empty(student.apellidoP))           studErr.apellidoP = 'Ingrese el apellido paterno';

                if (empty(student.apellidoM))           student.apellidoM = null;

                if (empty(student.rut))                 studErr.rut = 'Ingrese el RUT del estudiante';
                else if (!rut.validate(student.rut))    studErr.rut = 'El RUT ingresado no es válido';
                else await AdminGeneralModel.getPersonDataByRut(rut.format(student.rut))
                    .then(() => studErr.rut = 'El rut ya está registrado en el sistema')
                    .catch(() => {});

                if (empty(student.correo))              studErr.correo = 'Ingrese el correo del estudiante';
                else await AdminGeneralModel.getPersonDataByEmail(student.correo)
                    .then(() => studErr.correo = 'El correo ya está registrado para otro estudiante')
                    .catch(() => {});

                if (!empty(studErr)) {  studErr.id = i; errors.push(studErr); }
                i++;
            }

            if (!empty(errors)) {
                let x = checkError(Error('WRONG_DATA'),errors);
                return res.status(x.httpCode).json(x.body);
            }

            stdData = req.body;

        } else {
            // viene uno solo
            stdData = {};
        }

        AdminGeneralModel.addNewStudents(stdData)
        .then( () => res.json({msg: 'Alumnos ingresados.'}) )
        .catch((err:Error) => {
            let x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });

    }


    static createAccounts (req:Request, res:Response) {
        AdminGeneralModel.createUsers()
        .then(data => {
            res.json({msg:'Cuentas creadas'})
            for (const p of data) {
                if (p.rol == "JUGADOR"){
                    const datos = {
                        playerName: `${p.nombre} ${p.apellidoP}${p.apellidoM ? ' '+p.apellidoM : ''}`,
                        teamName: p.nombreGrupo,
                        siteLink: process.env.URL,
                        password: p.claveGenerada
                    }
                    EmailSender.sendMail(p.correoUcn,"Registro en Vendedor Viajero","newPlayerMail.html",datos)
                    .then(data => { AdminGeneralModel.setEmailStatus(p.idPersona) })
                    .catch(err => { console.log({idUsuario: p.idUsuario, correo: p.correoUcn}); });
                    
                } else {
                    const datos = {
                        teacherName: `${p.nombre} ${p.apellidoP}${p.apellidoM ? ' '+p.apellidoM : ''}`,
                        siteLink: process.env.URL,
                        password: p.claveGenerada
                    }
                    EmailSender.sendMail(p.correoUcn,"Registro en Vendedor Viajero","newTeacherMail.html",datos)
                    .then(data => { AdminGeneralModel.setEmailStatus(p.idPersona) })
                    .catch(err => { console.log({idUsuario: p.idUsuario, correo: p.correoUcn}); });
                }
            }
            
        })
        .catch(err => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })
    }


}