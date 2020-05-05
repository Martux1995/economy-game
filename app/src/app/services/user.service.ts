import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';


const URL = environment.urlApi;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  token: string = null;
  rol = '';

  constructor( private http: HttpClient,
               private storageService: StorageService) { }

  async getRol() {
    return await this.storageService.getStorage('rol');
  }

  async getToken() {
    return await this.storageService.getStorage('token');
  }

    // Inicio de sesión
   async login( data ) {
      console.log('esto recibo', data);
      return new Promise( resolve => {
        this.http.post(`${ URL }/api/auth/login`, data )
        .subscribe( async resp => {
          // tslint:disable-next-line: no-string-literal
          const datos = resp['data'];
          const xToken = datos.token;
          let rol = datos.rol;
          let gameId = datos.gameId;
          let teamId = datos.teamId;

          await this.storageService.saveStorage( xToken, 'token' );
          await this.storageService.saveStorage( rol, 'rol' );
          console.log( resp );
          // await this.getUserData( xToken );
          resolve(true);
        }, async err => {
          console.log( err );
        });
      }).finally( async () => {
        console.log('Terminado');
      });
  }
}

