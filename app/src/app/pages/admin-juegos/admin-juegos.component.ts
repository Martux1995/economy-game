import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general.service';
import { DataService } from 'src/app/services/data.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { LoginService } from '../../services/login.service';
import { TableJuego } from 'src/app/interfaces/admin';
import { DTHeaderData, DTEvent } from 'src/app/interfaces/dataTable';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-admin-juegos',
  templateUrl: './admin-juegos.component.html',
  styleUrls: ['./admin-juegos.component.scss']
})
export class AdminJuegosComponent implements OnInit {

  // ELEMENTOS DEL MODAL NUEVO JUEGO
  @ViewChild('modalGame', { static: true }) modalGame: ModalDirective;

  // ELEMENTOS DEL MODAL
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  public titulo = '';
  public mensaje = '';
  public terminado;
  modalRef: BsModalRef;
  public elemento;


  // DATATABLES JUEGOS
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
    private loginService: LoginService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.getAllGames();
  }

  eventHandler(e: DTEvent) {
    console.log(e);
    switch (e.action) {
      case 'goDetailGame': {
        // @skipLocationChange --> oculta la ruta para que no muestre el id en url
        this.router.navigate(['admin/juegos/detalle/', e.id], {skipLocationChange: true});
        break;
      }
      case 'finishGame': {
        this.titulo = 'Finalizar Juego';
        this.mensaje = 'Esta acción dará por FINALIZADO el Juego, si desea continuar, presione Finalizar.';
        this.elemento = e.id;
        this.terminado = false;
        this.openModal(this.modal);
        break;
      }
      case 'beginGame': {
        this.titulo = 'Iniciar Juego';
        this.mensaje = 'Esta acción dará INICIO al Juego con los datos descritos en el detalle del mismo, si desea continuar, presione \
                        Iniciar.';
        this.elemento = e.id;
        this.terminado = true;
        this.openModal(this.modal);
        break;
      }
    }
  }

  getAllGames(){
    this.genServ.showSpinner();

    this.dataService.getGames().subscribe(resp => {
      this.listaJuegos = resp.data.map( j => {
        let botones;
        if (j.concluido){
          botones = [{action: 'goDetailGame',  text: 'Editar', classes: 'btn-info'},
                        {action: 'beginGame',    text: 'Iniciar Juego', classes: ' ml-1 btn-danger'}];
        }else{
          botones = [{action: 'goDetailGame',  text: 'Editar', classes: 'btn-info'},
                        {action: 'finishGame',    text: 'Finalizar Juego', classes: ' ml-1 btn-danger'}];
        }
        return {
          idJuego: j.idJuego,
          nombre: j.nombre,
          semestre: j.semestre,
          fechaInicio: j.fechaInicio,
          concluido: j.concluido ? 'CONCLUIDO' : 'EN EJECUCIÓN',
          actions: botones
        };
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

  finish(id){
    console.log(id);
    this.modalRef.hide();
    this.elemento = '';
  }

  begin(id){
    console.log(id);
    this.modalRef.hide();
    this.elemento = '';
  }

  addGame(){
    console.log('juego agregado');
    this.modalRef.hide();
  }

  openModal(modal) {
    this.modalRef = this.modalService.show(
      modal,
      Object.assign({}, { class: 'modal-lg', ignoreBackdropClick: true,
      keyboard: false, })
    );
  }

  openModalGame(modal) {
    this.modalRef = this.modalService.show(
      modal,
      Object.assign({}, { class: 'modal-lg', ignoreBackdropClick: true,
      keyboard: false, })
    );
  }
}
