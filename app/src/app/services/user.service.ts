import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GeneralService } from './general.service';
import { Response } from '../interfaces/response';
import { LoginResponse } from '../interfaces/auth';
import { Router } from '@angular/router';


const URL = environment.urlApi;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  isLogged = false;
  token: string = null;
  rol = '';

  constructor( 
    private router: Router,
    private general: GeneralService,
    private http: HttpClient
  ) { }

  getRol() {
    return localStorage.getItem('rol');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async renewToken () {
    const headers = { 'x-token': localStorage.getItem('token') };
    
    this.general.showSpinner();
    return this.http.post<Response<{token: string}>>(`${URL}/api/auth/renew`, {}, { headers }).toPromise()
      .then(res => {
        localStorage.setItem('token', res.data.token);
        this.router.navigate['/index'];
        this.general.hideSpinner();
        return true;
      }).catch(err => {
        localStorage.clear();
        this.router.navigate['/'];
        this.general.hideSpinner();
        return false;
      })
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
        localStorage.removeItem('token');
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

