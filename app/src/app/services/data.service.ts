import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Response } from '../interfaces/response';
import { Grupo } from '../interfaces/grupo';
import { environment } from '../../environments/environment';
import { Juegos } from '../interfaces/juego';
import { Juego, Jugadores } from '../interfaces/admin';

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

  // Agregar Estudiante
  // addStudent( data ) {
  //   const headers = { 'x-token': localStorage.getItem('token') };
  //   return this.http.post<Response>(`${ URL }/api/auth/login`, data, { headers } );
  // }

  // getCarreras () {
  //   return this.http.get<Response<Carrera[]>>('http://localhost:4000/api/data/carrera/');
  // }

  // getGroupData (groupId:number) {
  //   return this.http.get<Response<Grupo>>(`http://localhost:4000/api/games/1/groups/${groupId}`);
  // }

  // async getGroupData( token: string, gameId: string, groupId: number ){
  //   const headers = {
  //     'x-token': token
  //   };
  //   return new Promise<boolean>( resolve => {
  //     this.http.get(`${ URL }/api/game/${gameId}/groups/${groupId}/`, { headers } )
  //       .subscribe( async resp => {
  //         console.log(resp);
  //         this.datosGrupo = await resp['data'];
  //         resolve(true);
  //       }, err => {
  //         if( err ) {
  //           console.log( err );
  //           resolve(false);
  //         }
  //       });
  //   })
  //   .finally( async () => {
  //     console.log('Terminado');
  //   });
  // }

}
