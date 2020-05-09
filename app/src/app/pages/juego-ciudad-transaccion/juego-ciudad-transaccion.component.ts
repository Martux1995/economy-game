import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import { CiudadService } from 'src/app/services/ciudad.service';
import { GeneralService } from 'src/app/services/general.service';
import { UserService } from 'src/app/services/user.service';

import { Ciudad, IntercambioProducto } from 'src/app/interfaces/juego';
import { ErrorResponse } from 'src/app/interfaces/response';

@Component({
  selector: 'app-ciudad-transaccion',
  templateUrl: './juego-ciudad-transaccion.component.html',
  styleUrls: ['./juego-ciudad-transaccion.component.scss']
})
export class JuegoCiudadTransaccionComponent implements OnInit {

  public idCiudad: number;
  public ciudadData: Ciudad;

  public productos: any[] = [];

  constructor(
    private actRoute: ActivatedRoute,
    private genServ: GeneralService,
    private userService: UserService,
    private ciudadService: CiudadService,
    private router: Router
  ) {
    this.idCiudad = this.actRoute.snapshot.params.cityId;
    this.getCityData(this.idCiudad);
    this.getProductosByCity(this.idCiudad);
   }

  ngOnInit() { }

  getCityData(cityId:number) {
    this.genServ.showSpinner();
    this.ciudadService.getCiudadById(cityId).subscribe( resp => {
      this.ciudadData = resp.data;
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
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
    }, () => {
      this.genServ.hideSpinner();
    });
  }

  getProductosByCity(cityId:number) {
    this.genServ.showSpinner();
    this.ciudadService.getProductosByCityId(cityId).subscribe( resp => {
      for (let i = 0; i < resp.data.length; i++) {
        const p = resp.data[i];
        
        this.productos.push({
          idProducto: p.idProducto,
          nombre: p.nombre,
          stock: p.stock,
          bloques: p.bloques,
          precioCompra: p.precioCompra,
          precioVenta: p.precioVenta,
          cantidad: new FormControl(0),
          esCompra: true
        })

      }
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            this.userService.setLogin(false);
            break;
          }
          case 3001: case 3011: case 3012: {
            this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
            this.router.navigate(['/ciudades']);
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
    }, () => {
      this.genServ.hideSpinner();
    });
  }

  ventaOCompra ( valor: boolean, idProducto:number) {
    this.productos.find( p => p.idProducto == idProducto).esCompra = valor;
  }

  back() {
    this.router.navigate(['/ciudades']);
  }

  generateTransaction() {
    this.genServ.showSpinner();
    const cambios:IntercambioProducto[] = [];

    for (let i = 0; i < this.productos.length; i++) {
      const p = this.productos[i];
      
      if (p.cantidad.value > 0) {
        cambios.push({
          idProducto: p.idProducto,
          esCompra: p.esCompra,
          cantidad: p.cantidad.value
        });
      }
    }

    this.ciudadService.doTrade(this.idCiudad, cambios).subscribe( resp => {
      this.genServ.showToast("CORRECTO",`${resp.msg}`,"success");
      this.router.navigate(['/ciudades']);
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
            // Mostrar los avisos de error en el formulario
            break;
          }
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            this.userService.setLogin(false);
            break;
          }
          case 3001: case 3011: case 3012: {
            this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
            this.router.navigate(['/ciudades']);
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
    }, () => {
      this.genServ.hideSpinner();
    });
  }
}
