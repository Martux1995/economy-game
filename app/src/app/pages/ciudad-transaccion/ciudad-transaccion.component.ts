import { Component, OnInit } from '@angular/core';
import { ProductoCiudad, Ciudad, IntercambioProducto } from 'src/app/interfaces/ciudad';
import { CiudadService } from 'src/app/services/ciudad.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import { ResponseError } from '../../interfaces/response';

@Component({
  selector: 'app-ciudad-transaccion',
  templateUrl: './ciudad-transaccion.component.html',
  styleUrls: ['./ciudad-transaccion.component.scss']
})
export class CiudadTransaccionComponent implements OnInit {

  public idCiudad:number;
  public ciudadData:Ciudad;

  public productos:ProductoCiudad[];
  public compras:any[];

  constructor(
    private actRoute:ActivatedRoute,
    private http:CiudadService,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.idCiudad = this.actRoute.snapshot.params.cityId;

    this.http.getCiudadById(this.idCiudad).subscribe(d => {
      this.ciudadData = d.data;
    })

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
        }
      })
    })
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

}
