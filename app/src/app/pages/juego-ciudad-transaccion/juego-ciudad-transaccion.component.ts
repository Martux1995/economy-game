import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CiudadService } from 'src/app/services/ciudad.service';
import { GeneralService } from 'src/app/services/general.service';
import { LoginService } from 'src/app/services/login.service';

import { DataTableHeaderData } from 'src/app/components/datatable/datatable.component';
import { ErrorResponse } from 'src/app/interfaces/response';
import { IntercambioProducto, DataTableCiudadProducto } from 'src/app/interfaces/juego';
import { WebSocketService } from 'src/app/services/ws.service';

@Component({
  selector: 'app-juego-ciudad-transaccion',
  templateUrl: './juego-ciudad-transaccion.component.html',
  styleUrls: ['./juego-ciudad-transaccion.component.scss']
})
export class JuegoCiudadTransaccionComponent implements OnInit {

  private cityId:number;
  cityName:String = '';

  productList:DataTableCiudadProducto[] = [];

  productHeaders:DataTableHeaderData[] = [
    { name: 'ID',               id: 'id',           type: 'text',   hide:true },
    { name: 'Nombre Producto',  id: 'nombre',       type: 'text' },
    { name: 'Bloques',          id: 'bloques',      type: 'text' },
    { name: 'Stock Disponible', id: 'stock',        type: 'text' },
    { name: 'Precio Compra',    id: 'precioCompra', type: 'text' },
    { name: 'Precio Venta',     id: 'precioVenta',  type: 'text' },
    { name: 'Compra/Venta',     id: 'esCompra',     type: 'input',  input: 'switch', 
      props: { trueText: 'COMPRAR', trueColor: 'green', falseText: 'VENDER', falseColor: 'red' }
    },
    { name: 'Cantidad', id: 'amount', type: 'input', input: 'number'}
  ];

  ws;

  constructor (
    private actRoute: ActivatedRoute,
    private router:Router,
    private genServ:GeneralService,
    private loginService:LoginService,
    private ciudadService:CiudadService,
    private wsService:WebSocketService
  ) { 
    this.cityId = this.actRoute.snapshot.params.cityId;
    this.getDataInfo();
    this.getProducts();
  }

  ngOnInit(): void { 
    this.ws = this.wsService.listen('change-city-game-data').subscribe(r => {
      if (r.cityId == this.cityId) {
        console.log(r);
        console.log(this.productList);
        for (const p of r.products) {
          
          let x = this.productList.find(pr => pr.id == p.idProducto);
          
          if (x) {
            x.precioCompra = `$ ${p.precioCompra} <i class="fas fa-arrow-${p.precioCompra > x.precioCompra ? 'up text-danger' : (p.precioCompra < x.precioCompra ? 'down text-success' : '') }"></i>`;
            x.precioVenta = `$ ${p.precioVenta} <i class="fas fa-arrow-${p.precioVenta > x.precioVenta ? 'up text-danger' : (p.precioVenta < x.precioVenta ? 'down text-success' : '') }"></i>`;
            x.stock = p.stock;
          }
        }
        this.genServ.showToast('CAMBIO','Han cambiado algunos productos de la ciudad','info');
      }
    });
  }

  ngOnDestroy() {
    this.ws.unsubscribe();
  }

  getDataInfo() {
    this.genServ.showSpinner();
    this.ciudadService.getCiudadById(this.cityId).subscribe(resp => {
      this.cityName = resp.data.nombre;
      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            this.loginService.setLogout();
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

  getProducts () {
    this.genServ.showSpinner();
    this.ciudadService.getProductosByCityId(this.cityId).subscribe(resp => {
      this.productList = resp.data.map(p => {
        return {
          id: p.idProducto,
          nombre: p.nombre,
          bloques: p.bloques,
          stock: p.stock,
          precioCompra: `$ ${p.precioCompra}`,
          precioVenta: `$ ${p.precioVenta}`,
          amount: { control: new FormControl(0), errorText: '' },
          esCompra: true
        }
      });
      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            this.loginService.setLogout();
            break;
          }
          case 3001: case 3011: case 3012: {
            this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
            this.router.navigate(['/juego/ciudades']);
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

  tradeItems () {
    this.genServ.showSpinner();
    const cambios:IntercambioProducto[] = [];

    for (const p of this.productList) {
      if (p.amount.control.value > 0)
        cambios.push({
          idProducto: p.id,
          esCompra: p.esCompra,
          cantidad: Number(p.amount.control.value)
        });        
    }

    this.ciudadService.doTrade(this.cityId, cambios).subscribe( resp => {
      this.genServ.showToast("CORRECTO",`${resp.msg}`,"success");
      this.genServ.hideSpinner();
      this.router.navigate(['/juego/ciudades']);
    }, (err:ErrorResponse<IntercambioProducto[]>) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
            // for (const r of err.error.err) {
            // }
            break;
          }
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            this.loginService.setLogout();
            break;
          }
          case 3001: case 3011: case 3012: {
            this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
            this.router.navigate(['/juego/ciudades']);
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

  exit() {
    this.router.navigateByUrl('/juego/ciudades');
  }
}
