import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginService } from './login.service';

import { environment } from "src/environments/environment";
import { Response } from '../interfaces/response';
import { Juego, JuegoDetalle, Ciudad, ProductData, CiudadData, CiudadProducto } from '../interfaces/teacher';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  constructor(
    private http:HttpClient,
    private loginService:LoginService
  ) { }

  /**
   * Obtiene todos los juegos donde el profesor participa con una ciudad válida.
   */
  getTeacherGames() {
    let headers = { 'x-token': this.loginService.getToken() }
    return this.http.get<Response<Juego[]>>(`${environment.urlApi}/api/teacher/games`,{ headers });
  }

  /**
   * Obtiene el detalle de un juego donde el profesor participe con una ciudad válida.
   * @param gameId El id del juego
   */
  getGameById(gameId:number) {
    let headers = { 'x-token': this.loginService.getToken() }
    return this.http.get<Response<JuegoDetalle>>(`${environment.urlApi}/api/teacher/games/${gameId}`,{ headers });
  }

  /**
   * Obtiene todas las ciudades válidas de un profesor
   */
  getTeacherCities() {
    let headers = { 'x-token': this.loginService.getToken() }
    return this.http.get<Response<Ciudad[]>>(`${environment.urlApi}/api/teacher/cities`,{ headers });
  }

  /**
   * Obtiene el detalle de una ciudad válida que sea del profesor
   * @param cityId El id de la ciudad
   */
  getTeacherCityData(cityId:number) {
    let headers = { 'x-token': this.loginService.getToken() }
    return this.http.get<Response<Ciudad>>(`${environment.urlApi}/api/teacher/cities/${cityId}`,{ headers });
  }

  /**
   * Actualiza los datos de una ciudad perteneciente al profesor
   * @param cityId El id de la ciudad
   * @param data Los datos a actualizar
   */
  updateTeacherCityData(cityId:number,data:CiudadData) {
    let headers = { 'x-token': this.loginService.getToken() }
    return this.http.post<Response>(`${environment.urlApi}/api/teacher/cities/${cityId}`,data,{ headers });
  }

  /**
   * Obtiene el detalle de los productos que comercializa la ciudad del profesor.
   * @param cityId El id de la ciudad
   */
  getTeacherCityProductsData(cityId) {
    let headers = { 'x-token': this.loginService.getToken() }
    return this.http.get<Response<CiudadProducto[]>>(`${environment.urlApi}/api/teacher/cities/${cityId}/products`,{ headers });
  }

  /**
   * Actualiza información de los productos que se comercializan en la ciudad.
   * @param cityId El id de la ciudad
   * @param data Los datos de los productos que la ciudad comercializa
   */
  updateTeacherCityProductsData(cityId:number,data:ProductData[]) {
    let headers = { 'x-token': this.loginService.getToken() }
    return this.http.post<Response>(`${environment.urlApi}/api/teacher/cities/${cityId}/products`,data,{ headers });
  }
}
