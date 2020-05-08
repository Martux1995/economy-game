import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';

import { CiudadProducto, Ciudad, IntercambioProducto } from 'src/app/interfaces/juego';
import { CiudadService } from 'src/app/services/ciudad.service';
import { UserService } from '../../services/user.service';
import { GeneralService } from 'src/app/services/general.service';
import { HttpErrorResponse } from '@angular/common/http';
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
  public compras: any[];

// Elementos para simular el carro de compras
  public carrito: any[] = []; // Arreglo de elementos en el carro
// -----------------------------------------------

  // Mensaje de tiempo limite de compra
  alerts: any[] = [{
    type: 'success',
    msg: `MENSAJE IMPORTANTE: A Partir de esta hora registrada de acceso ${new Date().toLocaleTimeString()} tienes 6 minutos para realizar tu transacción`,
    timeout: 60000000 // 600000 -> 10 minutos
  }];

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
    }, err => {
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
    }, err => {
      this.genServ.hideSpinner();
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
        alert(err.error.msg);
      }
      this.genServ.hideSpinner();
    }, () => {
      this.genServ.hideSpinner();
    })

    /*
    let x: IntercambioProducto[] = [];

    for (const e of this.carrito) {
      if (e.cantidadComprar > 0) {
        console.log('sadsad');
        x.push({cantidad: e.cantidadComprar, esCompra: true, idProducto: e.idProducto});
      }
      if (e.cantidadVender > 0) {
        x.push({cantidad: e.cantidadVender, esCompra: false, idProducto: e.idProducto});
      }
    }
    const token = await this.userService.getToken();
    const gameId = await localStorage.getItem('gameId');
    const transValido = await this.ciudadService.doTrade(token, gameId, this.idCiudad, x);
    if (transValido){
      alert('exito');
    }
    //   if (x.code != 0) {
    //     console.log(x);
    //   } else {
    //     this.router.navigate(['ciudades/']);
    //   }

    //  });*/

  }
}
