import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

import { CiudadService } from 'src/app/services/ciudad.service';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-ciudad-listado',
  templateUrl: './juego-ciudad-listado.component.html',
  styleUrls: ['./juego-ciudad-listado.component.scss']
})
export class JuegoCiudadListadoComponent implements OnInit {

  listaCiudades: any[] = [];

  tiempoActual:DateTime;

  constructor( 
    private generalService: GeneralService,
    private ciudadService: CiudadService,
    private router: Router 
  ) {
    this.getCiudades();
  }

  ngOnInit(){
  }

  getCiudades(){
    this.generalService.showSpinner();
    
    this.tiempoActual = DateTime.local();
    
    this.ciudadService.getCiudades().subscribe(resp => {
      for (let i = 0; i < resp.data.length; i++) {
        const c = resp.data[i];

        let horaAbre:DateTime = DateTime.fromFormat(c.horaAbre,'HH:mm:ss');
        let horaCierre:DateTime = DateTime.fromFormat(c.horaCierre,'HH:mm:ss');

        this.listaCiudades.push({
          idCiudad: c.idCiudad,
          nombre: c.nombre,
          descripcion: c.descripcion,
          urlImagen: c.urlImagen,
          horaAbre: horaAbre.toLocaleString(DateTime.TIME_24_SIMPLE),
          horaCierre: horaCierre.toLocaleString(DateTime.TIME_24_SIMPLE),
          abierto: horaAbre <= this.tiempoActual && this.tiempoActual <= horaCierre
        });
        
      }
    }, err => {
      if (err.status == 400) {
        alert(err.error.code + ': ' + err.error.msg);
        if (err.error.code == 2701) {
          localStorage.clear();
          this.router.navigate(['/'])
        } else {
          this.router.navigate(['/index'])
        }
      } else {
        alert('Error interno del servidor');
        console.log(err);
      }
      this.generalService.hideSpinner();
    }, () => {
      this.generalService.hideSpinner();
    });
  }

  closedCityClick () {
    alert("¡La ciudad se encuentra cerrada! ¡Regresa mañana!");
  }

  openCityClick( cityId: number ) {
    this.router.navigate(['/ciudades', cityId, 'intercambio']);
  }

}
