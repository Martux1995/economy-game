import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

import { Producto, Ciudad, CiudadProducto, IntercambioProducto } from '../interfaces/juego';
import { Response } from '../interfaces/response';

const URL = environment.urlApi;

@Injectable({
  providedIn: 'root'
})
export class CiudadService {

  ciudades: Ciudad[];
  ciudad: Ciudad;
  productos: CiudadProducto[];

  constructor(private http: HttpClient) { }

  // Obtiene los datos de las ciudades
  getCiudades( ){
    const headers = {
      'x-token': localStorage.getItem('token')
    };
    return this.http.get<Response<Ciudad[]>>(`${ URL }/api/game/cities `, { headers } );
  }

  getCiudadById( cityId: number ){
    const headers = { 'x-token': localStorage.getItem('token') };
      return this.http.get<Response<Ciudad>>(`${ URL }/api/game/cities/${cityId}`, { headers } );
  }

  getProductosByCityId( cityId: number ){
    const headers = { 'x-token': localStorage.getItem('token') };
    return this.http.get<Response<CiudadProducto[]>>(`${ URL }/api/game/cities/${cityId}/products`, { headers } );
  }

  doTrade(cityId: number, elements: IntercambioProducto[]){
    const headers = { 'x-token': localStorage.getItem('token') };
    return this.http.put<Response>(`${ URL }/api/game/cities/${cityId}/trade`, elements , { headers } );
  }

  LoadDownloadTruck(token: string, data) {
    const headers = {
      'x-token': token
    };
    return this.http.post<Response>(`${URL}/api/game/truck`, data, {headers});
  }

  getProductosByGameTruck(token: string) {
    const headers = {
      'x-token': token
    };
    return this.http.get<Response<Producto[]>>(`${URL}/api/game/products`, {headers});
  }

}