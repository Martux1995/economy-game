import { Component, OnInit } from '@angular/core';
import { Ciudad } from 'src/app/interfaces/ciudad';
import { Router, ActivatedRoute } from '@angular/router';
import { CiudadService } from 'src/app/services/ciudad.service';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-ciudad-seleccion',
  templateUrl: './ciudad-seleccion.component.html',
  styleUrls: ['./ciudad-seleccion.component.scss']
})
export class CiudadSeleccionComponent implements OnInit {

  listaCiudades: Ciudad[] = [];

  Profesor: boolean; // Cambiar cuando se puedan identificar roles

  imageDefault:string = 'http://localhost:4000/default_city.jpg';

  constructor( private ciudadService: CiudadService,
               private userService: UserService,
               private router: Router ) {
  }

  async ngOnInit(){
    await this.getCiudades();
    const rol = await this.userService.getRol();
    if (rol === 'PROFESOR'){
      this.Profesor = true;
    } else {
      this.Profesor = false;
    }
  }

  async getCiudades(){
    const token = await this.userService.getToken();
    const gameId = await localStorage.getItem('gameId');
    const valido = await this.ciudadService.getCiudades(token, gameId);
    if (valido) {
      this.listaCiudades = this.ciudadService.ciudades;
    }
  }

  onSelectCiudad( cityId: number ) {
    this.router.navigate(['/ciudades', cityId, 'intercambio']);
  }

  adminCiudad( cityId: number){
    this.router.navigate(['/profesor', cityId, 'ciudad']);
  }

}
