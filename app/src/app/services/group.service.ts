import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Response } from 'src/app/interfaces/response';
import { BloquesArrendados } from 'src/app/interfaces/juego';

import {environment} from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(
    private http: HttpClient
  ) { }

  getRentedBlocks () {
    const headers = { 'x-token': localStorage.getItem('token') || ''};
    return this.http.get<Response<BloquesArrendados>>(`${environment.urlApi}/api/game/blocks`, { headers });
  }

  rentNewBlocks (cant) {
    const headers = { 'x-token': localStorage.getItem('token') || ''};
    return this.http.post<Response>(`${environment.urlApi}/api/game/blocks`, {cant: cant}, { headers });
  }

  subletBlocks (cant) {
    const headers = { 'x-token': localStorage.getItem('token') || ''};
    return this.http.post<Response>(`${environment.urlApi}/api/game/blocks/sublet`, {cant: cant}, { headers });
  }
}
