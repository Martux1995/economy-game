import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import { Ciudad, Producto } from 'src/app/interfaces/juego';
import { ErrorResponse } from 'src/app/interfaces/response';

import { CiudadService } from 'src/app/services/ciudad.service';
import { GeneralService } from 'src/app/services/general.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-juego-bodega',
  templateUrl: './juego-bodega.component.html',
  styleUrls: ['./juego-bodega.component.scss']
})
export class JuegoBodegaComponent implements OnInit {

  public productos: any[] = [];

  constructor(
    private userService: UserService,
    private genServ: GeneralService,
    private ciudadService: CiudadService,
    private router: Router
  ) { }

  ngOnInit(){
    this.getProductosByGameTruck();
  }

  getProductosByGameTruck() {
    this.genServ.showSpinner();

    this.ciudadService.getProductosByGameTruck().subscribe(d => {
      this.productos = d.data.map(x => {
        return {
          nombre: x.nombre,
          bloques: x.bloques,
          idProducto: x.idProducto,
          cargando: true,
          cantidad: new FormControl(0)
        };
      });
      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
            break;
          }
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            this.userService.setLogin(false);
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

  transfer() {
    this.genServ.showSpinner();

    const truck: any[] = [];

    for (const prod of this.productos) {
      if (prod.cantidad.value > 0) {
        truck.push({
          idProducto: prod.idProducto,
          cargando: prod.cargando,
          cantidad: prod.cantidad.value
        });
      }
    }
    this.ciudadService.LoadDownloadTruck(truck).subscribe( d => {
      this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
      /**
       * @TODO Hay que reiniciar los formularios de alguna forma
       */  
      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
            // MOSTRAR LOS AVISOS DE ERROR EN EL FORMULARIO
            break;
          }
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            this.userService.setLogin(false);
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

  onFlagChange($valor: boolean, idProducto) {
    for (const prod of this.productos) {
      if (idProducto === prod.idProducto){
        prod.cargando = $valor;
      }
    }
  }
}
