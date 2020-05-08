import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import { Ciudad, IntercambioProducto } from 'src/app/interfaces/juego';
import { CiudadService } from 'src/app/services/ciudad.service';
import { GeneralService } from 'src/app/services/general.service';
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
    private ciudadService: CiudadService,
    private router: Router
  ) {
    this.idCiudad = this.actRoute.snapshot.params.cityId;
    this.getCityData(this.idCiudad);
    this.getProductosByCity(this.idCiudad);
   }

  ngOnInit(){
  }

  getCityData(cityId:number) {
    this.genServ.showSpinner();
    this.ciudadService.getCiudadById(cityId).subscribe( resp => {
      this.ciudadData = resp.data;
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        alert(err.error.code + ': ' + err.error.msg);
        if (err.error.code == 2701) {
          localStorage.clear();
          this.router.navigate(['/'])
        } else {
          this.router.navigate(['/ciudades'])
        }
      } else {
        alert('Error interno del servidor');
        console.log(err);
      }
      this.genServ.hideSpinner();
    }, () => {
      this.genServ.hideSpinner();
    })
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
        alert(err.error.code + ': ' + err.error.msg);
        if (err.error.code == 2701) {
          localStorage.clear();
          this.router.navigate(['/'])
        } else {
          this.router.navigate(['/ciudades'])
        }
      } else {
        alert('Error interno del servidor');
        console.log(err);
      }
    }, () => {
      this.genServ.hideSpinner();
    })
  }

  ventaOCompra ( valor: boolean, idProducto:number) {
    this.productos.find( p => p.idProducto == idProducto).esCompra = valor;
  }

  // onClosed(dismissedAlert: AlertComponent): void {
  //   this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  //   alert('Tiempo limite superado, serás redirigido a la pagina principal');
  //   this.router.navigate(['/ciudades']);
  // }

  back() {
    this.router.navigate(['/ciudades']);
  }

  async generateTransaction() {
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
    console.log(cambios);
    this.ciudadService.doTrade(this.idCiudad, cambios).subscribe( resp => {
      alert(resp.msg);
      this.router.navigate(['/ciudades']);
    }, (err:ErrorResponse) => {
      if (err.status == 400){
        alert(err.error.code + ': ' +err.error.msg);
      } else {
        alert('Error interno del servidor');
        console.log(err);
      }
      this.genServ.hideSpinner();
    }, () => {
      this.genServ.hideSpinner();
    })
  }
}
