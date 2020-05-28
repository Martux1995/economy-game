import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuarios } from 'src/app/interfaces/admin';
import { GeneralService } from 'src/app/services/general.service';
import { DataService } from 'src/app/services/data.service';
import { LoginService } from '../../services/login.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { DTEvent, DTHeaderData } from 'src/app/interfaces/dataTable';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.scss']
})
export class AdminUsuariosComponent implements OnInit {

  // ELEMENTOS DEL MODAL
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  public titulo = '';
  public mensaje = '';
  public activo;
  public elemento = '';
  modalRef: BsModalRef;

  // DATATABLES Usuarios
  listaUsuarios: Usuarios[] = [];

  headersUsuarios: DTHeaderData[] = [
    { name: 'ID',       id: 'idUsuario',  type: 'text', hide: true },
    { name: 'IDP',      id: 'idPersona',  type: 'text', hide: true },
    { name: 'RUT',      id: 'rut',        type: 'text' },
    { name: 'Nombre',   id: 'nombre',     type: 'text' },
    { name: 'Rol',      id: 'rol',        type: 'text' },
    { name: 'Estado',   id: 'estado',     type: 'text' },
    { name: 'Acciones', id: 'actions',    type: 'button'},
  ];

  constructor(
    private genServ: GeneralService,
    private dataService: DataService,
    private loginService: LoginService,
    private modalService: BsModalService
  ) { }

  async ngOnInit(){
    await this.getAllUsers();
  }

  handleActions(e: DTEvent) {
    console.log(e);
    switch (e.action) {
      case 'desactivate': {
        this.titulo = 'DESACTIVAR USUARIO';
        this.mensaje = 'Esta acción evitará que el usuario pueda interactuar con el sistema. Si desea continuar presione en DESACTIVAR';
        this.elemento = e.id;
        this.activo = true;
        this.openModal(this.modal);
        break;
      }
      case 'activate': {
        this.titulo = 'ACTIVAR USUARIO';
        this.mensaje = 'Esta acción hará que el usuario pueda interactuar con el sistema. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id;
        this.activo = false;
        this.openModal(this.modal);
        break;
      }
      case 'historial': {
        this.elemento = e.id;
        // Hacer algo
        break;
      }
    }
  }

  getAllUsers(){
    this.genServ.showSpinner();

    this.dataService.getAllUsers().subscribe(resp => {
      this.listaUsuarios = resp.data.map(p => {
        let botones; let valido;
        if (p.vigente){
          valido = 'Vigente';
          if (p.nombreRol === 'ADMINISTRADOR'){
            botones = [ {action: 'historial', text: 'Historial', classes: 'ml-1 btn-primary'},
                        // {action: 'desactivate', text: 'Desactivar', classes: 'ml-1 btn-danger'}
                      ];
          } else {
            botones = [ {action: 'changeRole', text: 'Rol', classes: 'btn-warning'},
                        // {action: 'historial', text: 'Historial', classes: 'ml-1 btn-primary'},
                        {action: 'desactivate', text: 'Desactivar', classes: 'ml-1 btn-danger'}];
          }
        } else {
          valido = 'No Vigente';
          if (p.nombreRol === 'ADMINISTRADOR'){
            botones = [ // {action: 'historial', text: 'Historial', classes: 'ml-1 btn-primary'},
                        {action: 'activate', text: 'Activar', classes: 'ml-1 btn-success'}];
          } else {
            botones = [ {action: 'changeRole', text: 'Rol', classes: 'btn-warning'},
                        // {action: 'historial', text: 'Historial', classes: 'ml-1 btn-primary'},
                        {action: 'activate', text: 'Activar', classes: 'ml-1 btn-success'}];
          }
        }
        return {
          idUsuario: p.idUsuario,
          idPersona: p.idPersona,
          nombre: p.nombre,
          rut: p.rut,
          rol: p.nombreRol,
          estado: valido,
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

  desactivateUser(id){
    console.log('desactivar', id);
    this.modalRef.hide();
    this.elemento = '';
  }

  activateUser(id){
    console.log('activar', id);
    this.modalRef.hide();
    this.elemento = '';
  }

  openModal(modal) {
    this.modalRef = this.modalService.show(
      modal,
      Object.assign({}, { class: 'modal-lg', ignoreBackdropClick: true,
      keyboard: false, })
    );
  }
}
