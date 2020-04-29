import { Component, OnInit } from '@angular/core';
import { ProductoCiudad, Ciudad, IntercambioProducto } from 'src/app/interfaces/ciudad';
import { CiudadService } from 'src/app/services/ciudad.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';

import { ResponseError } from '../../interfaces/response';

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
    private http: CiudadService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.idCiudad = this.actRoute.snapshot.params.cityId;

    this.http.getCiudadById(this.idCiudad).subscribe(d => {
      this.ciudadData = d.data;
    });

    this.http.getProductosByCityId(this.idCiudad).subscribe(d => {
      this.productos = d.data;
      this.compras = d.data.map(x => {
        return {
          idProducto: x.idProducto,
          nombreProducto: x.nombreProducto,
          bloquesTotal: x.bloquesTotal,
          precioCompra: x.precioCompra,
          precioVenta: x.precioVenta,
          cantCompra: new FormControl(0),
          cantVenta: new FormControl(0)
        };
      });
    });
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
    alert('Tiempo limite superado, serás redirigido a la pagina principal');
    this.router.navigate(['/ciudades']);
  }

  generateTransaction () {
    let x:IntercambioProducto[] = [];

    for (const e of this.compras) {
      if (e.cantCompra.value > 0) {
        x.push({cantidad: e.cantCompra.value, esCompra: "true", idProducto: e.idProducto})
      }
      if (e.cantVenta.value > 0) {
        x.push({cantidad: e.cantVenta.value, esCompra: "false", idProducto: e.idProducto})
      }
    }

    console.log(x);
    this.http.doTrade(this.idCiudad,x).subscribe( x => {
      alert(x.msg); 
      
      if (x.code != 0) {
        console.log(x);
      } else {
        this.router.navigate(['ciudades/'])
      }
      
    });

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
