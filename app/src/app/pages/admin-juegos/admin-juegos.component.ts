import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general.service';
import { DataService } from 'src/app/services/data.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { LoginService } from '../../services/login.service';
import { TableJuego } from 'src/app/interfaces/admin';
import { DTHeaderData, DTEvent } from 'src/app/interfaces/dataTable';

@Component({
  selector: 'app-admin-juegos',
  templateUrl: './admin-juegos.component.html',
  styleUrls: ['./admin-juegos.component.scss']
})
export class AdminJuegosComponent implements OnInit {
  
  public showModalFinish = false;
  
  //DATATABLES JUEGOS
  public listaJuegos: TableJuego[] = [];

  headersJuegos: DTHeaderData[] = [
    { name: 'ID',           id: 'idJuego',      type: 'text', hide: true },
    { name: 'Nombre',       id: 'nombre',       type: 'text' },
    { name: 'Semestre',     id: 'semestre',     type: 'text' },
    { name: 'Fecha Inicio', id: 'fechaInicio',  type: 'text' },
    { name: 'Estado',       id: 'concluido',    type: 'text' },
    { name: 'Acciones',     id: 'actions',      type: 'button'},
  ];

  constructor( 
    private router: Router,
    private genServ: GeneralService,
    private dataService: DataService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.getAllGames();
  }

  eventHandler(e:DTEvent) {
    console.log(e);
    switch (e.action) {
      case 'goDetailGame': {
        this.router.navigate(['admin/juegos/detalle/', e.id]);
        break;
      }
      case 'finishGame': {
        this.showModalFinish = true;
        break;
      }
    }
  }

  getAllGames(){
    this.genServ.showSpinner();

    this.dataService.getGames().subscribe(resp => {
      this.listaJuegos = resp.data.map( j => {
        return {
          idJuego: j.idJuego,
          nombre: j.nombre,
          semestre: j.semestre,
          fechaInicio: j.fechaInicio,
          concluido: j.concluido ? 'CONCLUIDO' : 'EN EJECUCIÓN',
          actions: [
            {action: 'goDetailGame',  text: 'Editar', classes: 'btn-info'},
            {action: 'finishGame',    text: 'Finalizar Juego', classes: ' ml-1 btn-danger'}
          ]
        }
      });
      this.genServ.hideSpinner();
    }, (err: ErrorResponse) => {
      if (err.status === 400) {
        switch (err.error.code) {
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.loginService.setLogout();
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
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

  finishGame($event){
    this.showModalFinish = false;
  }
}
