import { Component, OnInit } from '@angular/core';
import { Ciudad, ProductoCiudad } from 'src/app/interfaces/ciudad';
import { ActivatedRoute, Router } from '@angular/router';
import { CiudadService } from 'src/app/services/ciudad.service';
import { UserService } from '../../services/user.service';
import { FormControl } from '@angular/forms';
import { Producto } from '../../interfaces/juego';

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
  public truck: any[] = [];

  constructor(
    private actRoute: ActivatedRoute,
    private ciudadService: CiudadService,
    private userService: UserService,
    private router: Router
  ) {

   }

  async ngOnInit(){
    const token = await this.userService.getToken();
    await this.getProductosByGameTruck(token);
  }

  async getProductosByGameTruck(token: string) {
    this.ciudadService.getProductosByGameTruck(token).subscribe(d => {
      this.productos = d.data.map(x => {
        return {
          nombre: x.nombre,
          bloques: x.bloques,
          idProducto: x.idProducto,
          cargando: true,
          cantidad: new FormControl(0)
        };
      });
    });
  }

  async transfer() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.productos.length; i++) {
      const camion = this.productos[i];
      if ( camion.cantidad.value > 0) {
        this.truck.push({
          idProducto: camion.idProducto,
          cargando: camion.cargando,
          cantidad: camion.cantidad.value
        });
      }
    }
    console.log(this.truck);
    const token = await this.userService.getToken();
    this.ciudadService.LoadDownloadTruck(token, this.truck).subscribe( d => {
      alert(d.msg);
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
