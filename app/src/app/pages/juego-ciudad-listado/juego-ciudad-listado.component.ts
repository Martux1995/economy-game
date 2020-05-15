import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

import { ErrorResponse } from 'src/app/interfaces/response';

import { CiudadService } from 'src/app/services/ciudad.service';
import { GeneralService } from 'src/app/services/general.service';
import { LoginService } from 'src/app/services/login.service';

const URL = environment.urlApi;

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ciudad-listado',
  templateUrl: './juego-ciudad-listado.component.html',
  styleUrls: ['./juego-ciudad-listado.component.scss']
})
export class JuegoCiudadListadoComponent implements OnInit {

  listaCiudades: any[] = [];

  tiempoActual:DateTime;

  constructor( 
    private loginService: LoginService,
    private genServ: GeneralService,
    private ciudadService: CiudadService,
    private router: Router 
  ) { }

  ngOnInit() { 
    this.getCiudades();
  }

  getCiudades(){
    this.genServ.showSpinner();
    
    this.tiempoActual = DateTime.local();
    
    this.ciudadService.getCiudades().subscribe(resp => {
      for (const c of resp.data) {

        let horaAbre:DateTime = DateTime.fromFormat(c.horaAbre,'HH:mm:ss');
        let horaCierre:DateTime = DateTime.fromFormat(c.horaCierre,'HH:mm:ss');

        this.listaCiudades.push({
          idCiudad: c.idCiudad,
          nombre: c.nombre,
          descripcion: c.descripcion,
          urlImagen: c.urlImagen ? `${URL}/images/cities/${c.urlImagen}` : null,
          horaAbre: horaAbre.toLocaleString(DateTime.TIME_24_SIMPLE),
          horaCierre: horaCierre.toLocaleString(DateTime.TIME_24_SIMPLE),
          abierto: horaAbre <= this.tiempoActual && this.tiempoActual <= horaCierre
        });
        
        this.listaCiudades.sort((a,b) => {
          if ( a.nombre < b.nombre )  return -1;
          if ( a.nombre > b.nombre )  return 1;
          return 0;
        });
      }
      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.loginService.setLogout();
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            break;
          }
          default: {
            this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
          }
        }
      } else {
        this.genServ.showToast("ERROR DESCONOCIDO",`Error interno del servidor.`,"danger");
        console.log(err);
      }
      this.genServ.hideSpinner();
    });
  }

  closedCityClick () {
    this.genServ.showToast("CIUDAD CERRADA",`La ciudad se encuentra cerrada en estos momentos. Regresa mañana.`,"danger");
  }

  openCityClick( cityId: number ) {
    this.router.navigate(['/juego/ciudades', cityId, 'intercambio']);
  }

}
