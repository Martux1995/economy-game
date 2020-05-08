import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Response } from '../interfaces/response';
import { Grupo } from '../interfaces/grupo';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  datosGrupo: Grupo;

  constructor(private http: HttpClient) { }

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
