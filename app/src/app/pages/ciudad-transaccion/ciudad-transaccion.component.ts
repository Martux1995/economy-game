import { Component, OnInit } from '@angular/core';
import { ProductoCiudad, Ciudad, IntercambioProducto } from 'src/app/interfaces/ciudad';
import { CiudadService } from 'src/app/services/ciudad.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';

import { ResponseError } from '../../interfaces/response';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-ciudad-transaccion',
  templateUrl: './ciudad-transaccion.component.html',
  styleUrls: ['./ciudad-transaccion.component.scss']
})
export class CiudadTransaccionComponent implements OnInit {

  public idCiudad: number;
  public ciudadData: Ciudad;

  public productos: ProductoCiudad[];
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
    private ciudadService: CiudadService,
    private userService: UserService,
    private router: Router
  ) { }

  async ngOnInit(){
    this.idCiudad = await this.actRoute.snapshot.params.cityId;
    const token = await this.userService.getToken();
    const gameId = await localStorage.getItem('gameId');
    await this.getCityData(token, gameId, this.idCiudad);
    await this.getProductosByCity(token, gameId, this.idCiudad);
  }

  async getCityData(token: string, gameId: string, idCiudad: number) {
    const datosCiudad = await this.ciudadService.getCiudadById(token, gameId, idCiudad);
    if (datosCiudad) {
      this.ciudadData = await this.ciudadService.ciudad;
    }
  }

  async getProductosByCity(token: string, gameId: string, idCiudad: number) {
    const productosCiudad = await this.ciudadService.getProductosByCityId(token, gameId, idCiudad);
    if (productosCiudad) {
      this.productos = await this.ciudadService.productos;
    }
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
    alert('Tiempo limite superado, serás redirigido a la pagina principal');
    this.router.navigate(['/ciudades']);
  }

  async generateTransaction() {
    let x: IntercambioProducto[] = [];

    for (const e of this.carrito) {
      if (e.cantidadComprar > 0) {
        console.log('sadsad');
        x.push({cantidad: e.cantidadComprar, esCompra: 'true', idProducto: e.idProducto});
      }
      if (e.cantidadVender > 0) {
        x.push({cantidad: e.cantidadVender, esCompra: 'false', idProducto: e.idProducto});
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

    //  });

  }

// Funciones del Carro de compra
  addBuy( nombre: string, idProduct: number){
    let encontrado = false;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.carrito.length; i++) {
      if (nombre === this.carrito[i].nombreProducto){
        this.carrito[i].cantidadComprar = this.carrito[i].cantidadComprar + 1;
        encontrado = true;
        break;
      }
    }
    if (!encontrado){
      this.carrito.push({
        idProducto: idProduct,
        nombreProducto: nombre,
        cantidadComprar: 1,
        cantidadVender: 0,
      });
    }
    console.log(this.carrito);
  }

  minusBuy( nombre: string){
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.carrito.length; i++) {
      if (nombre === this.carrito[i].nombreProducto){
        if ((this.carrito[i].cantidadComprar - 1) === 0 || (this.carrito[i].cantidadComprar - 1) <= 0 ){
          this.carrito[i].cantidadComprar = 0;
          break;
        } else {
          this.carrito[i].cantidadComprar = this.carrito[i].cantidadComprar - 1;
        }
      }
    }
    console.log(this.carrito);
  }

  addSell( nombre: string, idProduct: number){
    let encontrado = false;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.carrito.length; i++) {
      if (nombre === this.carrito[i].nombreProducto){
        this.carrito[i].cantidadVender = this.carrito[i].cantidadVender + 1;
        encontrado = true;
        break;
      }
    }
    if (!encontrado){
      this.carrito.push({
        idProducto: idProduct,
        nombreProducto: nombre,
        cantidadComprar: 0,
        cantidadVender: 1,
      });
    }
    console.log(this.carrito);
  }

  minusSell( nombre: string){
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.carrito.length; i++) {
      if (nombre === this.carrito[i].nombreProducto){
        if ((this.carrito[i].cantidadVender - 1) === 0 || (this.carrito[i].cantidadVender - 1) <= 0 ){
          this.carrito[i].cantidadVender = 0;
          break;
        } else {
          this.carrito[i].cantidadVender = this.carrito[i].cantidadVender - 1;
        }
      }
    }
  }

}
