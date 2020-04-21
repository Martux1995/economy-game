import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Response, ResponseError } from '../interfaces/response';
import { Ciudad, ProductoCiudad, IntercambioProducto } from '../interfaces/ciudad';


@Injectable({
  providedIn: 'root'
})
export class CiudadService {

  constructor(private http:HttpClient) { }

  getCiudades () {
    return this.http.get<Response<Ciudad[]>>('http://localhost:4000/api/games/1/cities');
  }

  getCiudadById (cityId:number) {
    return this.http.get<Response<Ciudad>>(`http://localhost:4000/api/games/1/cities/${cityId}`);
  }

  getProductosByCityId (cityId:number) {
    return this.http.get<Response<ProductoCiudad[]>>(`http://localhost:4000/api/games/1/cities/${cityId}/products`);
  }

  doTrade (cityId:number,elements:IntercambioProducto[]) {
    return this.http.put<Response<string> | ResponseError<string>>(`http://localhost:4000/api/games/1/play/1/trade/${cityId}`,elements);
  }

}