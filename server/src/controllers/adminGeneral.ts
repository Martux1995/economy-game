import { Request, Response } from 'express';
import empty from 'is-empty';
import rut from 'rut.js';

import checkError from '../middleware/errorHandler';
import EmailSender, { MailData } from '../middleware/emailSender';

import AdminGeneralModel from '../models/adminGeneral';

import { StudentData, Persona } from '../interfaces/admin';

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
        }

        AdminGeneralModel.addNewStudents(stdData, req.body.idCarrera)
        .then( (data) => res.json({msg: 'Alumnos ingresados.', data: data}) )
        .catch((err:Error) => {
            let x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });

    }

    static async addNewTeacher(req:Request, res:Response) {

        let teacherData: StudentData;

        const teacherError:any = {};

        if (empty(req.body.nombres))             teacherError.nombres = 'Ingrese los nombres del profesor';
        if (empty(req.body.apellidoP))           teacherError.apellidoP = 'Ingrese el apellido paterno';
        if (empty(req.body.apellidoM))           req.body.apellidoM = null;
        if (empty(req.body.rut))                 teacherError.rut = 'Ingrese el RUT del profesor';
        else if (!rut.validate(req.body.rut))    teacherError.rut = 'El RUT ingresado no es válido';
        else await AdminGeneralModel.getPersonDataByRut(rut.format(req.body.rut))
            .then(() => teacherError.rut = 'El rut ya está registrado en el sistema')
            .catch(() => {});

        if (empty(req.body.correo))              teacherError.correo = 'Ingrese el correo del profesor';
        else await AdminGeneralModel.getPersonDataByEmail(req.body.correo)
            .then(() => teacherError.correo = 'El correo ya está registrado para otro profesor')
            .catch(() => {});        

        if (!empty(teacherError))
        return res.status(400).json({code: 1, msg: 'Datos incorrectos', err: teacherError});
        req.body.rut = rut.format(req.body.rut); // formatea el rut antes de ser enviado a la query
        teacherData = req.body;

        AdminGeneralModel.addNewTeacher(teacherData)
        .then( () => res.json({msg: 'Profesor ingresado.'}) )
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
            .catch(err => { console.log(err.message); });

            EmailSender.sendMail("newPlayerMail.html", "Registro en Vendedor Viajero",playerMails)
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

    static getCarrerById(req: Request, res: Response) {
        const id = Number(req.params.carrerId);

        if (id == 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});
            
        AdminGeneralModel.getCarrerById(id)
        .then( (data) => res.json({msg:'Datos de la Carrera Obtenidos', data: data}) )
        .catch( (err:Error) => {
            if (err.message == 'CARRER_GET_ERROR') {
                return res.status(400).json({code: 1, msg: 'No se pudo obtener los datos de la Carrera'});
            } else {
                return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
            }
        });
    }

    static getAllTeachers(req: Request, res: Response) {
        AdminGeneralModel.getAllTeachers()
        .then( (data) => res.json({msg:'Profesores obtenidos', data: data}) )
        .catch( (err) => res.status(400).json({code: 1, msg: 'Error retornando los datos'}) )
    }

    static getTeacherById(req: Request, res: Response) {
        const id = Number(req.params.teacherId);

        if (id == 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});
            
        AdminGeneralModel.getTeacherById(id)
        .then( (data) => res.json({msg:'Datos del Profesor Obtenidos', data: data}) )
        .catch( (err:Error) => {
            if (err.message == 'TEACHER_GET_ERROR') {
                return res.status(400).json({code: 1, msg: 'No se pudo obtener los datos del Profesor'});
            } else {
                return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
            }
        });
    }

    static getAllStudents(req: Request, res: Response) {
        AdminGeneralModel.getAllStudents()
        .then( (data) => res.json({msg:'Alumnos obtenidos', data: data}) )
        .catch( (err) => res.status(400).json({code: 1, msg: 'Error retornando los datos'}) )
    }

    static getStudentById(req: Request, res: Response) {
        const id = Number(req.params.studentId);

        if (id == 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});
            
        AdminGeneralModel.getStudentById(id)
        .then( (data) => res.json({msg:'Datos del Alumno Obtenidos', data: data}) )
        .catch( (err:Error) => {
            if (err.message == 'STUDENT_GET_ERROR') {
                return res.status(400).json({code: 1, msg: 'No se pudo obtener los datos del Alumno'});
            } else {
                return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
            }
        });
    }

    static desactivateTeacher (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.teacherId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGeneralModel.desactivateTeacher (id)
            .then( (data) => res.json({msg:'Profesor Desactivado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'TEACHER_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar la carrera'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static activateTeacher (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.teacherId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGeneralModel.activateTeacher (id)
            .then( (data) => res.json({msg:'Profesor Activado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'TEACHER_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar la carrera'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static desactivateStudent (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.studentId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGeneralModel.desactivateStudent (id)
            .then( (data) => res.json({msg:'Alumno Desactivado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'ALUMNO_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar el Alumno'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static activateStudent (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.studentId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGeneralModel.activateStudent (id)
            .then( (data) => res.json({msg:'Alumno Activado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'ALUMNO_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar el Alumno'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static desactivateUser (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.userId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGeneralModel.desactivateUser (id)
            .then( (data) => res.json({msg:'Usuario Desactivado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'USER_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar el Usuario'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static activateUser (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.userId);

        if (id <= 0 || Number.isNaN(id))
            return res.status(400).json({code: 1, msg:'El valor entregado es inválido'});

        AdminGeneralModel.activateUser (id)
            .then( (data) => res.json({msg:'Usuario Activado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'USER_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar el Usuario'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static async updateTeacher (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.teacherId);

        let teacherData: StudentData;

        const teacherError:any = {};

        if (id <= 0 || Number.isNaN(id))         teacherError.id = 'Valor entregado inválido para actualizar'
        if (empty(req.body.nombres))             teacherError.nombres = 'Ingrese los nombres del profesor';
        if (empty(req.body.apellidoP))           teacherError.apellidoP = 'Ingrese el apellido paterno';
        if (empty(req.body.apellidoM))           req.body.apellidoM = null;

        if (empty(req.body.correo))              teacherError.correo = 'Ingrese el correo del profesor';
        else await AdminGeneralModel.getPersonDataByEmailById(req.body.correo, id)
            .then(() => teacherError.correo = 'El correo ya está registrado para otro profesor')
            .catch(() => {});        

        if (!empty(teacherError)) {
            let x = checkError(Error('WRONG_DATA'),teacherError);
            return res.status(x.httpCode).json(x.body);
        }
        req.body.rut = rut.format(req.body.rut); // formatea el rut antes de ser enviado a la query
        teacherData = req.body;

        AdminGeneralModel.updateTeacher (id, teacherData)
            .then( (data) => res.json({msg:'Profesor actualizado', data: data}) )
            .catch( (err:Error) => {
                switch (err.message) {
                    case 'TEACHER_UPDATE_ERROR':
                        return res.status(400).json({code: 1, msg: 'No se pudo actualizar el profesor'});
                    default:
                        return res.status(500).json({code: 1, msg: 'Error interno del servidor'});
                }
            });
    }

    static async updateStudent (req: Request, res: Response) {
        const errors:any = {};

        const id = Number(req.params.studentId);
        let stdData: StudentData;

        const stdError:any = {};

        if (id <= 0 || Number.isNaN(id))         stdError.id = 'Valor entregado inválido para actualizar'
        if (empty(req.body.nombres))             stdError.nombres = 'Ingrese los nombres del estudiante';
        if (empty(req.body.apellidoP))           stdError.apellidoP = 'Ingrese el apellido paterno';
        if (empty(req.body.apellidoM))           req.body.apellidoM = null;
        if (empty(req.body.rut))                 stdError.rut = 'Ingrese el RUT del estudiante';

        if (empty(req.body.correo))              stdError.correo = 'Ingrese el correo del estudiante';
        else await AdminGeneralModel.getPersonDataByEmailById(req.body.correo, id)
            .then(() => stdError.correo = 'El correo ya está registrado para otro estudiante')
            .catch(() => {});
        
        if (empty(req.body.idCarrera))           stdError.idCarrera = 'Seleccione Carrera';         

        if (!empty(stdError))
            return res.status(400).json({code: 1, msg: 'Datos incorrectos', err: stdError});
        
        req.body.rut = rut.format(req.body.rut); // formatea el rut antes de ser enviado a la query
        
        stdData = req.body;

        AdminGeneralModel.updateStudent(id, stdData, req.body.idCarrera)
        .then( () => res.json({msg: 'Datos Alumno actualizado.'}) )
        .catch((err:Error) => {
            let x = checkError(err);
            return res.status(x.httpCode).json(x.body);
        });
    }

}