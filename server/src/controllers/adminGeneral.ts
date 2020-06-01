import { Request, Response } from 'express';
import empty from 'is-empty';
import rut from 'rut.js';

import checkError from '../middleware/errorHandler';
import EmailSender, { MailData } from '../middleware/emailSender';

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

            const teacherMails:MailData[] = [];
            const playerMails:MailData[] = [];

            for (const t of data.teachers) {
                teacherMails.push({
                    to: t.correoUcn,
                    data: {
                        teacherName: `${t.nombre} ${t.apellidoP}${t.apellidoM ? ' '+t.apellidoM : ''}`,
                        siteLink: process.env.URL,
                        password: t.claveGenerada
                    }
                });
            }
            
            for (const p of data.players) {
                playerMails.push({
                    to: p.correoUcn,
                    data: {
                        teacherName: `${p.nombre} ${p.apellidoP}${p.apellidoM ? ' '+p.apellidoM : ''}`,
                        teamName: p.nombreGrupo,
                        siteLink: process.env.URL,
                        password: p.claveGenerada
                    }
                }); 
            }

            EmailSender.sendMail("newTeacherMail.html", "Registro en Vendedor Viajero",teacherMails)
            // @ts-ignore
            .then(data => { AdminGeneralModel.setEmailStatus(teacherMails.map(t => t.to)) })
            .catch(err => { console.log(err.message); });

            EmailSender.sendMail("newPlayerMail.html", "Registro en Vendedor Viajero",playerMails)
            // @ts-ignore
            .then(data => { AdminGeneralModel.setEmailStatus(playerMails.map(t => t.to)) })
            .catch(err => { console.log(err.message); });
        })
        .catch(err => {
            const x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        })
    }

    static getAllUsers(req: Request, res: Response) {
        AdminGeneralModel.getAllUsers()
        .then( (data) => res.json({msg:'Usuarios obtenidos', data: data}) )
        .catch( (err) => res.status(400).json({code: 1, msg: 'Error retornando los datos'}) )
    }

    static getAllCarrers(req: Request, res: Response) {
        AdminGeneralModel.getAllCarrers()
        .then( (data) => res.json({msg:'Carreras obtenidas', data: data}) )
        .catch( (err) => res.status(400).json({code: 1, msg: 'Error retornando los datos'}) )
    }

    static getAllTeachers(req: Request, res: Response) {
        AdminGeneralModel.getAllTeachers()
        .then( (data) => res.json({msg:'Profesores obtenidos', data: data}) )
        .catch( (err) => res.status(400).json({code: 1, msg: 'Error retornando los datos'}) )
    }

    static getAllStudents(req: Request, res: Response) {
        AdminGeneralModel.getAllStudents()
        .then( (data) => res.json({msg:'Alumnos obtenidos', data: data}) )
        .catch( (err) => res.status(400).json({code: 1, msg: 'Error retornando los datos'}) )
    }

}