import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { environment } from 'src/environments/environment';

import { Response } from '../interfaces/response';

import { GeneralService } from './general.service';
import { LoginResponse } from '../interfaces/auth';

const URL = environment.urlApi;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  isLogged = false;

  constructor( 
    private router: Router,
    private general: GeneralService,
    private http: HttpClient
  ) { }

  // Observable que permite saber si la sesión está iniciada o no
  sessionStatus: Subject<boolean> = new Subject();

  /**
   * Permite indicar si la sesión se encuentra iniciada o no. Si se cambia a no iniciada, esta funcion borra el LocalStorage y redirige a la raiz
   * @param isLogged Indica si se está iniciando o cerrando la sesión.
   */
  setLogin (isLogged:boolean) {
    this.isLogged = isLogged;
    this.sessionStatus.next(this.isLogged);
    if (!isLogged){
      localStorage.clear();
      this.router.navigate(['/']);
    }
  }

  getRol() {
    return localStorage.getItem('rol');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setUserData (token:string,rol:string = null,gameId:number = null,teamId:number = null,teamName:string = null) {
    localStorage.setItem('token', token);
    if (rol) localStorage.setItem('rol', rol);
    if (gameId) localStorage.setItem('gameId', String(gameId));
    if (teamId) localStorage.setItem('teamId', String(teamId));
    if (rol == "JUGADOR") { localStorage.setItem('team', teamName); }

    this.setLogin(true);
  }

  renewToken () {
    const headers = { 'x-token': localStorage.getItem('token') || ''};
    
    return this.http.post<Response<{token: string}>>(`${URL}/api/auth/renew`, {}, { headers });
  }

    // Inicio de sesión
  login( data ) {
    localStorage.removeItem('token');
    return this.http.post<Response<LoginResponse>>(`${ URL }/api/auth/login`, data );
  }


  logout() {
    const headers = { 'x-token': localStorage.getItem('token') };
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

