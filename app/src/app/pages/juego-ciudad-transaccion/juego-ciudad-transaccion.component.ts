import { Component, OnInit } from '@angular/core';
import { CiudadService } from 'src/app/services/ciudad.service';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableHeaderData } from 'src/app/components/datatable/datatable.component';

@Component({
  selector: 'app-juego-ciudad-transaccion',
  templateUrl: './juego-ciudad-transaccion.component.html',
  styleUrls: ['./juego-ciudad-transaccion.component.scss']
})
export class JuegoCiudadTransaccionComponent implements OnInit {

  private cityId:number;

  ciudadData:any = {
    nombre: 'ASD'
  }

  productList:{}[] = [];

  productHeaders:DataTableHeaderData[] = [
    { name: 'ID',               id: 'id',           type: 'text',   hide:true },
    { name: 'Nombre Producto',  id: 'nombre',       type: 'text' },
    { name: 'Bloques',          id: 'bloques',      type: 'text' },
    { name: 'Stock Disponible', id: 'stock',        type: 'text' },
    { name: 'Precio Compra',    id: 'precioCompra', type: 'text' },
    { name: 'Precio Venta',     id: 'precioVenta',  type: 'text' },
    { name: 'Compra/Venta',     id: 'esCompra',     type: 'input',  input: 'switch', 
      props: {
        trueText: 'COMPRAR', trueColor: 'green', falseText: 'VENDER', falseColor: 'red'
      }
    },
    { name: 'Cantidad', id: 'amount', type: 'input', input: 'number'},
    { name: 'Acción', id: 'action', type: 'button', 
      props: [{
        action: console.log, classes: 'btn-block btn-primary btn-sm'
      },{
        classes: 'btn-block btn-warning btn-sm'
      }]
    }
  ];

  
  // showLog(id:string) {
  //   console.log(id);
  // }

  constructor(
    private actRoute: ActivatedRoute,
    private router:Router,
    private ciudadService:CiudadService
  ) { 
    this.cityId = this.actRoute.snapshot.params.cityId;
  }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts () {
    this.ciudadService.getProductosByCityId(this.cityId).subscribe(resp => {
      this.productList = resp.data.map(p => {
        return {
          id: p.idProducto,
          nombre: p.nombre,
          bloques: p.bloques,
          stock: p.stock,
          precioCompra: `$ ${p.precioCompra}`,
          precioVenta: `$ ${p.precioVenta}`,
          esCompra: true,
          amount: new FormControl(0)
        }
      })
    })
  }

  tradeItems () {
    console.log(this.productList);
    
  }


  exit() {
    this.router.navigateByUrl('/juego/ciudades');
  }
}
