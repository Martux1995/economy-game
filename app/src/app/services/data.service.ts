import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Response } from '../interfaces/response';
import { Grupo } from '../interfaces/grupo';
import { environment } from '../../environments/environment';
import { Juegos } from '../interfaces/juego';
import { Juego, Jugadores, Persona, Carrera, Usuarios, AdminAlumno, AdminProfesor, Grupos, Ciudades, Productos, Historial } from '../interfaces/admin';

const URL = environment.urlApi;

@Injectable({
  providedIn: 'root'
})
export class DataService {

  datosGrupo: Grupo;

  constructor(private http: HttpClient) { }

  getGames( ){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<Juegos[]>>(`${ URL }/api/admin/games`, { headers } );
  }

  getGameById(idJuego){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<Juego>>(`${ URL }/api/admin/games/${idJuego}`, { headers } );
  }

  getPlayersGameById(idJuego){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<Jugadores[]>>(`${ URL }/api/admin/games/${idJuego}/players`, { headers } );
  }

  getGroupsByGameId(idJuego){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<Grupos[]>>(`${ URL }/api/admin/games/${idJuego}/groups`, { headers } );
  }

  getCitiesByGameId(idJuego){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<Ciudades[]>>(`${ URL }/api/admin/games/${idJuego}/cities`, { headers } );
  }

  getProductsByGameId(idJuego){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<Productos[]>>(`${ URL }/api/admin/games/${idJuego}/products`, { headers } );
  }

  getRecordByGameId(idJuego){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<Historial[]>>(`${ URL }/api/admin/games/${idJuego}/record`, { headers } );
  }

  getAllCarrers( ){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<Carrera[]>>(`${ URL }/api/admin/general/carrers`, { headers } );
  }

  getAllTeachers( ){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<Persona[]>>(`${ URL }/api/admin/general/teachers`, { headers } );
  }

  getAllStudents( ){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<Persona[]>>(`${ URL }/api/admin/general/students`, { headers } );
  }

  getAllUsers( ){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<Usuarios[]>>(`${ URL }/api/admin/users`, { headers } );
  }

  getDataCarrerById(idCarrer){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<Carrera>>(`${ URL }/api/admin/general/carrers/${idCarrer}`, { headers } );
  }

  getDataTeacherById(idTeacher){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<AdminProfesor>>(`${ URL }/api/admin/general/teachers/${idTeacher}`, { headers } );
  }

  getDataStudentById(idStudent){
    const headers = { 'x-token': localStorage.getItem('token')};
    return this.http.get<Response<AdminAlumno>>(`${ URL }/api/admin/general/students/${idStudent}`, { headers } );
  }

  addCarrer( data ){
    const headers = { 'x-token': localStorage.getItem('token') };
    return this.http.put<Response>(`${ URL }/api/data/carreras`, data, { headers } );
  }

  editCarrer( idCarrera: number, data ){
    const headers = { 'x-token': localStorage.getItem('token') };
    return this.http.post<Response>(`${ URL }/api/data/carreras/${idCarrera}`, data, { headers } );
  }

  desactivateCarrer( idCarrera: number){
    const headers = { 'x-token': localStorage.getItem('token') };
    return this.http.post<Response>(`${ URL }/api/data/carreras/${idCarrera}/desactivate`, {}, { headers } );
  }

  activateCarrer( idCarrera: number){
    const headers = { 'x-token': localStorage.getItem('token') };
    return this.http.post<Response>(`${ URL }/api/data/carreras/${idCarrera}/activate`, {}, { headers } );
  }

  desactivateTeacher( idProfesor: number){
    const headers = { 'x-token': localStorage.getItem('token') };
    return this.http.post<Response>(`${ URL }/api/admin/general/teachers/${idProfesor}/desactivate`, {}, { headers } );
  }

  activateTeacher( idProfesor: number){
    const headers = { 'x-token': localStorage.getItem('token') };
    return this.http.post<Response>(`${ URL }/api/admin/general/teachers/${idProfesor}/activate`, {}, { headers } );
  }

  desactivateStudent( idAlumno: number){
    const headers = { 'x-token': localStorage.getItem('token') };
    return this.http.post<Response>(`${ URL }/api/admin/general/students/${idAlumno}/desactivate`, {}, { headers } );
  }

  activateStudent( idAlumno: number){
    const headers = { 'x-token': localStorage.getItem('token') };
    return this.http.post<Response>(`${ URL }/api/admin/general/students/${idAlumno}/activate`, {}, { headers } );
  }

  desactivateUser( idUsuario: number){
    const headers = { 'x-token': localStorage.getItem('token') };
    return this.http.post<Response>(`${ URL }/api/admin/users/${idUsuario}/desactivate`, {}, { headers } );
  }

  activateUser( idUsuario: number){
    const headers = { 'x-token': localStorage.getItem('token') };
    return this.http.post<Response>(`${ URL }/api/admin/users/${idUsuario}/activate`, {}, { headers } );
  }

  // Agregar Estudiante
  // addStudent( data ) {
  //   const headers = { 'x-token': localStorage.getItem('token') };
  //   return this.http.post<Response>(`${ URL }/api/auth/login`, data, { headers } );
  // }


}
