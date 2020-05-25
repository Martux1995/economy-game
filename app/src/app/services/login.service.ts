import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { environment } from 'src/environments/environment';

import { Response } from '../interfaces/response';

import { LoginResponse } from '../interfaces/auth';

const URL = environment.urlApi;

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  // Variable para saber si el usuario ha iniciado o no la sesión
  private isLogged = false;

  // Observable que cambia el estado del inicio de sesión
  sessionStatus: Subject<boolean> = new Subject();

  constructor(private http: HttpClient) { }

  isAuthenticated ()            
    { return this.isLogged && this.getToken() != ""; }

  setToken (token:string)
    { localStorage.setItem('token', token); }

  getToken ():string
    { return localStorage.getItem('token') || ''; }


  setRol (rol:string)
    { localStorage.setItem('rol', rol); }

  getRol ()
    { return localStorage.getItem('rol') || ''; }


  setName (name:string)
    { localStorage.setItem('userName', name); }
  getName ()
    { return localStorage.getItem('userName') || ''; }


  setTeamName (teamName:string)
    { localStorage.setItem('teamName', teamName); }
  getTeamName ()
    { return localStorage.getItem('teamName') || ''; }


  clearData ()
    { localStorage.clear(); }

  setLogout ()
    { this.clearData(); this.isLogged = false; this.sessionStatus.next(false); }


  setUserData (payload:LoginResponse) {
    this.isLogged = payload.token != '';

    if (this.isLogged){
      this.setToken(payload.token);
      this.setRol(payload.rol);
      this.setTeamName(payload.teamName || '');
      this.setName(payload.userName);
    } else {
      this.clearData();
    }    
    this.sessionStatus.next(this.isLogged);
  }

  // Inicio de sesión
  login( data: any ) {
    this.clearData();
    return this.http.post<Response<LoginResponse>>(`${ URL }/api/auth/login`, data );
  }

  // Renovación de token
  renewToken () {
    const headers = { 'x-token': this.getToken() };
    return this.http.post<Response<LoginResponse>>(`${URL}/api/auth/renew`, {}, { headers });
  }

  // Cerrar sesión
  logout() {
    const headers = { 'x-token': this.getToken() };
    return this.http.post(`${ URL }/api/auth/logout`, { }, { headers });
  }

}