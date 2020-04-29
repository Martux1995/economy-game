import { Component, OnInit } from '@angular/core';
import { Ciudad, ProductoCiudad } from 'src/app/interfaces/ciudad';
import { ActivatedRoute, Router } from '@angular/router';
import { CiudadService } from 'src/app/services/ciudad.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-profesor-ciudad',
  templateUrl: './profesor-ciudad.component.html',
  styleUrls: ['./profesor-ciudad.component.scss']
})
export class ProfesorCiudadComponent implements OnInit {

  public idCiudad: number;
  public ciudadData: Ciudad;

  public productos: ProductoCiudad[];
  public compras: any[];

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

  saveChanges() {

  }

}
