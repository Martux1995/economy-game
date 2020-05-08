import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GeneralService } from './general.service';
import { Response } from '../interfaces/response';
import { LoginResponse } from '../interfaces/auth';


const URL = environment.urlApi;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  isLogged = false;
  token: string = null;
  rol = '';

  constructor( 
    private general: GeneralService,
    private http: HttpClient
  ) { }

  async getRol() {
    return await localStorage.getItem('rol');
  }

  async getToken() {
    return await localStorage.getItem('token');
  }

    // Inicio de sesión
  login( data ) {
    localStorage.removeItem('token');
    return this.http.post<Response<LoginResponse>>(`${ URL }/api/auth/login`, data );
  }


  logout( token: string) {
    const headers = { 'x-token': token };
    return this.http.post(`${ URL }/api/auth/logout`, { }, { headers });
  }

  async validateToken( token: string) {
    const headers = {
      'x-token': token
    };
    return new Promise( resolve => {
      this.http.get(`${ URL }/api/auth/validate`, { headers })
      .subscribe( async resp => {
        console.log( resp );
        resolve(true);
      }, async err => {
        console.log( err );
      });
    }).finally( async () => {
        this.general.hideSpinner();
      });
  }

  isAuthenticated() {
    return this.isLogged;
  }

}

