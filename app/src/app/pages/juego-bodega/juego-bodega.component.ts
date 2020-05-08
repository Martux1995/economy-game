import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import { Ciudad } from 'src/app/interfaces/juego';
import { Producto } from '../../interfaces/juego';

import { CiudadService } from 'src/app/services/ciudad.service';
import { UserService } from '../../services/user.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-juego-bodega',
  templateUrl: './juego-bodega.component.html',
  styleUrls: ['./juego-bodega.component.scss']
})
export class JuegoBodegaComponent implements OnInit {

  public idCiudad: number;
  public ciudadData: Ciudad;

  public productos: any[];
  public productosTruck: Producto[];

  public arregloTemp: any[];

  constructor(
    private genServ: GeneralService,
    private ciudadService: CiudadService,
    private router: Router
  ) { }

  async ngOnInit(){
    await this.getProductosByGameTruck();
  }

  async getProductosByGameTruck() {
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
    }, (err:ErrorResponse) => {
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
      this.genServ.hideSpinner();
    }, () => {
      this.genServ.hideSpinner();
    });
  }

  async transfer() {
    this.genServ.showSpinner();
    const truck: any[] = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.productos.length; i++) {
      const camion = this.productos[i];
      if ( camion.cantidad.value > 0) {
        truck.push({
          idProducto: camion.idProducto,
          cargando: camion.cargando,
          cantidad: camion.cantidad.value
        });
      }
    }
    console.log(truck);

    this.ciudadService.LoadDownloadTruck(truck).subscribe( d => {
      alert(d.msg);
      this.router.navigate(['/index']);
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        alert(err.error.code + ': ' + err.error.msg);
        if (err.error.code == 2701) {
          localStorage.clear();
          this.router.navigate(['/'])
        }
      } else {
        alert('Error interno del servidor');
        console.log(err);
      }
      this.genServ.hideSpinner();
    }, () => {
      this.genServ.hideSpinner();
    });

  }

  onFlagChange($valor: boolean, idProducto) {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.productos.length; i++) {
      if (idProducto === this.productos[i].idProducto){
        this.productos[i].cargando = $valor;
      }
    }
  }
}
