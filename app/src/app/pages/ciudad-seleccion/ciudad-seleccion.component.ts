import { Component, OnInit } from '@angular/core';
import { Ciudad } from 'src/app/interfaces/ciudad';
import { Router, ActivatedRoute } from '@angular/router';
import { CiudadService } from 'src/app/services/ciudad.service';


@Component({
  selector: 'app-ciudad-seleccion',
  templateUrl: './ciudad-seleccion.component.html',
  styleUrls: ['./ciudad-seleccion.component.scss']
})
export class CiudadSeleccionComponent implements OnInit {

  listaCiudades: Ciudad[] = [];

  Profesor = false; // Cambiar cuando se puedan identificar roles

  imageDefault:string = `http://localhost:4000/default_city.jpg`

  constructor( 
    private ciudadHttp:CiudadService, 
    private router:Router ) { 
  }
  
  onSelectCiudad ( cityId: number ) {
    this.router.navigate(['/ciudades', cityId, 'intercambio']);
  }
  
  ngOnInit(): void {
    this.ciudadHttp.getCiudades().subscribe( d => {
      this.listaCiudades = d.data;
    });
  }

  adminCiudad( cityId: number){
    this.router.navigate(['/profesor', cityId, 'ciudad']);
  }

}
