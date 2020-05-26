import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general.service';
import { DataService } from 'src/app/services/data.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { LoginService } from '../../services/login.service';
import { TableJuego } from 'src/app/interfaces/admin';
import { DataTableHeaderData } from 'src/app/components/datatable/datatable.component';

@Component({
  selector: 'app-admin-juegos',
  templateUrl: './admin-juegos.component.html',
  styleUrls: ['./admin-juegos.component.scss']
})
export class AdminJuegosComponent implements OnInit {
  
  public showModalFinish = false;
  public concluido;
  public listaJuegos: any[] = [];

  // DATATABLES JUEGOS
  // listaJuegos: TableJuego[] = [];

  // headersJuegos: DataTableHeaderData[] = [
  //   { name: 'ID',           id: 'id',     type: 'text', hide: true },
  //   { name: 'Nombre',       id: 'nombre',      type: 'text' },
  //   { name: 'Semestre',     id: 'semestre',      type: 'text' },
  //   { name: 'Fecha Inicio', id: 'fechaInicio',      type: 'text' },
  //   { name: 'Estado',       id: 'estado',      type: 'text' },
  //   { name: 'Acciones',     id: 'actions',     type: 'button',
  //           props: [{action: this.goDetailGame, text: 'Editar', classes: 'btn-info'},
  //                   {action: this.finishGame, text: 'Finalizar Juego', classes: ' ml-1 btn-danger'}]
  //   },
  // ];

  constructor( private router: Router,
               private genServ: GeneralService,
               private dataService: DataService,
               private loginService: LoginService) { }

  ngOnInit(): void {
    this.getAllGames();
  }

  getAllGames(){
    this.genServ.showSpinner();

    this.dataService.getGames().subscribe(resp => {
      for (const c of resp.data) {
        if (c.concluido){
          this.concluido = 'Concluido';
        }else{
          this.concluido = 'Abierto';
        }
        this.listaJuegos.push({
          idJuego: c.idJuego,
          nombre: c.nombre,
          semestre: c.semestre,
          fechaInicio: c.fechaInicio,
          estado: this.concluido,
          error: ''
        });
      }
      // this.listaJuegos = resp.data.map(p => {
      //   let valido;
      //   if (p.concluido){
      //     valido = 'Concluido';
      //   } else {
      //     valido = 'Abierto';
      //   }
      //   return {
      //     id: p.idJuego,
      //     nombre: p.nombre,
      //     semestre: p.semestre,
      //     fechaInicio: p.fechaInicio,
      //     estado: valido,
      //   };
      // });
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

  goDetailGame(idJuego){
    // console.log(idJuego);
    this.router.navigate(['admin/juegos/detalle/', idJuego]);
  }

}
