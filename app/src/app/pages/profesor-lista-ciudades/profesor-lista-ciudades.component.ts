import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

import { TeacherService } from 'src/app/services/teacher.service';
import { GeneralService } from 'src/app/services/general.service';

import { ErrorResponse } from 'src/app/interfaces/response';

import { environment } from "src/environments/environment";

@Component({
  selector: 'app-profesor-lista-ciudades',
  templateUrl: './profesor-lista-ciudades.component.html',
  styleUrls: ['./profesor-lista-ciudades.component.scss']
})
export class ProfesorListaCiudadesComponent implements OnInit {

  gameList:any[] = [];

  cityList:any[] = [];
  filteredCities:any[] = [];

  constructor(
    private router:Router,
    private genServ:GeneralService,
    private teacherService:TeacherService
  ) { }

  ngOnInit(): void {
    this.getGames();
  }

  getGames() {
    this.genServ.showSpinner();
    this.teacherService.getTeacherGames().subscribe(resp => {
      this.gameList = resp.data.map(g => {
        return {
          id: g.idJuego,
          text: `${g.nombre} [${g.semestre}]`
        }
      });
      
      this.getCities();
      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
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

  getCities() {
    this.genServ.showSpinner();
    this.teacherService.getTeacherCities().subscribe(resp => {
      this.cityList = resp.data.map(c => {
        return {
          idJuego: c.idJuego,
          idCiudad: c.idCiudad,
          urlImagen: `${environment.urlApi}/images/cities/${c.urlImagen}`,
          nombre: c.nombreCiudad,
          descripcion: c.descripcion,
          horaAbre: DateTime.fromFormat(c.horaAbre,'HH:mm:ss'),
          horaCierre: DateTime.fromFormat(c.horaCierre,'HH:mm:ss')
        }
      });
      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
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

  toCity(id:number) {
    this.router.navigate(['ciudades',id]);
  }

  getGameName(id:number): string {
    return this.gameList.find(g => g.id == id).text;
  }

  onGameChange(event) {
    let gameId:number = event.target.value;
    
    if (gameId > 1) {
      this.filteredCities = this.cityList.filter(c => c.idJuego == gameId);
    } else {
      this.filteredCities = this.cityList;
    }
  }

}
