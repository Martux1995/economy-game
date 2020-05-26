import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Response } from '../interfaces/response';
import { Grupo } from '../interfaces/grupo';
import { environment } from '../../environments/environment';
import { Juegos } from '../interfaces/juego';
import { Juego, Jugadores, Persona, Carrera, Usuarios } from '../interfaces/admin';

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

  // Agregar Estudiante
  // addStudent( data ) {
  //   const headers = { 'x-token': localStorage.getItem('token') };
  //   return this.http.post<Response>(`${ URL }/api/auth/login`, data, { headers } );
  // }


}
