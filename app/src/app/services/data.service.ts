import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Response } from '../interfaces/response';
import { Carrera } from '../interfaces/carrera';
import { Grupo } from '../interfaces/grupo';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http:HttpClient) { }

  getCarreras () {
    return this.http.get<Response<Carrera[]>>('http://localhost:4000/api/data/carrera/');
  }

  getGroupData (groupId:number) {
    return this.http.get<Response<Grupo>>(`http://localhost:4000/api/games/1/groups/${groupId}`);
  }

}
