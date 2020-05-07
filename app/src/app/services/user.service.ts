import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';


const URL = environment.urlApi;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  isLogged = false;
  token: string = null;
  rol = '';

  constructor( private http: HttpClient) { }

  async getRol() {
    return await localStorage.getItem('rol');
  }

  async getToken() {
    return await localStorage.getItem('token');
  }

    // Inicio de sesión
   async login( data ) {
      await localStorage.removeItem('token');
      console.log('esto recibo', data);
      return new Promise( resolve => {
        this.http.post(`${ URL }/api/auth/login`, data )
        .subscribe( async resp => {
          // tslint:disable-next-line: no-string-literal
          const datos = resp['data'];
          const xToken = datos.token;
          const rol = datos.rol;
          const gameId = datos.gameId;
          const teamId = datos.teamId;

          await localStorage.setItem('token', xToken );
          await localStorage.setItem( 'rol', rol );
          await localStorage.setItem( 'gameId', gameId );
          await localStorage.setItem( 'teamId', teamId );
          console.log( resp );
          this.isLogged = true;
          resolve(true);
        }, async err => {
          console.log( err );
          this.isLogged = false;
        });
      }).finally( async () => {
        await console.log('Terminado');
      });
  }


  async logout( token: string) {
    return new Promise( resolve => {
      const headers = {
        'x-token': token
      };
      this.http.post(`${ URL }/api/auth/logout`, { }, { headers })
      .subscribe( async resp => {
        console.log( resp );
        await localStorage.clear();
        this.isLogged = false;
        resolve(true);
      }, async err => {
        console.log( err );
      });
    }).finally( async () => {
        console.log('Terminado');
      });
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
        console.log('Terminado');
      });
  }

  isAuthenticated() {
    return this.isLogged;
  }

}

