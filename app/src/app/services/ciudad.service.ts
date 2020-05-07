import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ciudad, ProductoCiudad, IntercambioProducto } from '../interfaces/ciudad';
import { environment } from '../../environments/environment';

const URL = environment.urlApi;

@Injectable({
  providedIn: 'root'
})
export class CiudadService {

  ciudades: Ciudad[];
  ciudad: Ciudad;
  productos: ProductoCiudad[];

  constructor(private http: HttpClient) { }

  // Obtiene los datos de las ciudades
  async getCiudades( token: string, gameId: string ){
    const headers = {
      'x-token': token
    };
    return new Promise<boolean>( resolve => {
      this.http.get(`${ URL }/api/game/cities `, { headers } )
        .subscribe( async resp => {
          console.log(resp);
          this.ciudades = await resp['data'];
          resolve(true);
        }, err => {
          if( err ) {
            console.log( err );
            resolve(false);
          }
        });
    })
    .finally( async () => {
      console.log('Terminado');
    });
  }

  async getCiudadById( token: string, gameId: string, cityId: number ){
    const headers = {
      'x-token': token
    };
    return new Promise<boolean>( resolve => {
      this.http.get(`${ URL }/api/game/cities/${cityId}`, { headers } )
        .subscribe( async resp => {
          console.log(resp);
          this.ciudad = await resp['data'];
          resolve(true);
        }, err => {
          if( err ) {
            console.log( err );
            resolve(false);
          }
        });
    })
    .finally( async () => {
      console.log('Terminado');
    });
  }

  async getProductosByCityId( token: string, gameId: string, cityId: number ){
    const headers = {
      'x-token': token
    };
    return new Promise<boolean>( resolve => {
      this.http.get(`${ URL }/api/game/cities/${cityId}/products`, { headers } )
        .subscribe( async resp => {
          console.log(resp);
          this.productos = await resp['data'];
          resolve(true);
        }, err => {
          if( err ) {
            console.log( err );
            resolve(false);
          }
        });
    })
    .finally( async () => {
      console.log('Terminado');
    });
  }

  async doTrade( token: string, gameId: string, cityId: number, elements: IntercambioProducto[]){
    const headers = {
      'x-token': token
    };
    return new Promise<boolean>( resolve => {
      this.http.put(`${ URL }/api/game/cities/${cityId}/trade`, elements , { headers } )
        .subscribe( async resp => {
          console.log(resp);
          resolve(true);
        }, err => {
          if ( err ) {
            console.log( err );
            resolve(false);
          }
        });
    })
    .finally( async () => {
      console.log('Terminado');
    });
  }

  // doTrade(cityId: number, elements: IntercambioProducto[]) {
  //   return this.http.put<Response<string> | ResponseError<string>>(`http://localhost:4000/api/games/1/play/1/trade/${cityId}`,elements);
  // }

}