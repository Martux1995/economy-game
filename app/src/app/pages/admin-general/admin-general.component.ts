import { Component, OnInit, ViewChild } from '@angular/core';
import { Carrera } from 'src/app/interfaces/admin';
import { Persona } from '../../interfaces/admin';
import { GeneralService } from 'src/app/services/general.service';
import { DataService } from 'src/app/services/data.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { LoginService } from '../../services/login.service';
import { DTHeaderData, DTEvent } from 'src/app/interfaces/dataTable';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-admin-general',
  templateUrl: './admin-general.component.html',
  styleUrls: ['./admin-general.component.scss']
})
export class AdminGeneralComponent implements OnInit {

  // ELEMENTOS MODAL ADD CARRER
  @ViewChild('modalPersona', { static: true }) modalPersona: ModalDirective;

  // ELEMENTOS MODAL ADD CARRER
  @ViewChild('modalCarrer', { static: true }) modalCarrer: ModalDirective;

  // ELEMENTOS DEL MODAL INFO
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  public titulo = '';
  public mensaje = '';
  public activo;
  public rol;
  public elemento = '';
  modalRef: BsModalRef;

  // DATATABLES CARRERA
  listaCarreras: Carrera[] = [];

  headersCarrera: DTHeaderData[] = [
    { name: 'ID',       id: 'idCarrera',   type: 'text', hide: true },
    { name: 'Nombre',   id: 'nombre',      type: 'text' },
    { name: 'Estado',   id: 'estado',      type: 'text' },
    { name: 'Acciones', id: 'actions',     type: 'button'},
  ];

  // DATATABLES PROFESORES
  listaProfesores: Persona[] = [];

  headersProfesores: DTHeaderData[] = [
    { name: 'ID',       id: 'idPersona',   type: 'text', hide: true },
    { name: 'Nombre',   id: 'nombre',      type: 'text' },
    { name: 'Estado',   id: 'estado',      type: 'text' },
    { name: 'Acciones', id: 'actions',     type: 'button' },
  ];

  // DATATABLES ALUMNOS
  listaAlumnos: Persona[] = [];

  headersAlumnos: DTHeaderData[] = [
    { name: 'ID',       id: 'idPersona',   type: 'text', hide: true },
    { name: 'RUT',      id: 'rut',         type: 'text' },
    { name: 'Nombre',   id: 'nombre',      type: 'text' },
    { name: 'Estado',   id: 'estado',      type: 'text' },
    { name: 'Acciones', id: 'actions',     type: 'button'},
  ];

  constructor(private genServ: GeneralService,
              private dataService: DataService,
              private loginService: LoginService,
              private modalService: BsModalService) { }

  async ngOnInit(){
    await this.getAllCarrers();
    await this.getAllTeachers();
    await this.getAllStudents();

  }

  handleActions(e: DTEvent) {
    console.log(e.id, e.action);

    switch (e.action) {
      case 'desactivateCarrer': {
        this.titulo = 'DESACTIVAR CARRERA';
        this.mensaje = 'Esta acción desactivará la carrera del sistema. Si desea continuar presione en DESACTIVAR';
        this.elemento = e.id; this.activo = true; this.rol = 'CARRERA';
        this.openModal(this.modal);
        break;
      }
      case 'activateCarrer': {
        this.titulo = 'ACTIVAR CARRERA';
        this.mensaje = 'Esta acción activará la carrera del sistema. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id; this.rol = 'CARRERA'; this.activo = false;
        this.openModal(this.modal);
        break;
      }
      case 'desactivateTeacher': {
        this.titulo = 'DESACTIVAR PROFESOR';
        this.mensaje = 'Esta acción desactivará el profesor del sistema. Si desea continuar presione en DESACTIVAR';
        this.elemento = e.id; this.rol = 'PROFESOR';
        this.openModal(this.modal);
        break;
      }
      case 'activateTeacher': {
        this.titulo = 'ACTIVAR PROFESOR';
        this.mensaje = 'Esta acción activará el profesor del sistema. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id; this.rol = 'PROFESOR';
        this.openModal(this.modal);
        break;
      }
      case 'desactivateStudent': {
        this.titulo = 'DESACTIVAR ALUMNO';
        this.mensaje = 'Esta acción desactivará el alumno del sistema. Si desea continuar presione en DESACTIVAR';
        this.elemento = e.id; this.rol = 'ALUMNO';
        this.openModal(this.modal);
        break;
      }
      case 'activateStudent': {
        this.titulo = 'ACTIVAR ALUMNO';
        this.mensaje = 'Esta acción activará el alumno del sistema. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id; this.rol = 'ALUMNO';
        this.openModal(this.modal);
        break;
      }
    }

  }

  getAllCarrers(){
    this.genServ.showSpinner();

    this.dataService.getAllCarrers().subscribe(resp => {
      console.log('carreras', resp.data);
      this.listaCarreras = resp.data.map(p => {
        let botones; let valido;
        if (p.vigente){
          valido = 'Vigente';
          botones = {action: 'desactivateCarrer', text: 'Desactivar', classes: 'ml-1 btn-danger btn-block'};
        } else {
          valido = 'No Vigente';
          botones = {action: 'activateCarrer', text: 'Activar', classes: 'ml-1 btn-success btn-block'};
        }
        return {
          idCarrera: p.idCarrera,
          nombre: p.nombreCarrera,
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

  getAllTeachers(){
    this.genServ.showSpinner();

    this.dataService.getAllTeachers().subscribe(resp => {
      // console.log('jugadores', resp.data);
      this.listaProfesores = resp.data.map(p => {
        let botones; let valido;
        if (p.vigente){
          valido = 'Vigente';
          botones = {action: 'desactivateTeacher', text: 'Desactivar', classes: 'ml-1 btn-danger btn-block'};
        } else {
          valido = 'No Vigente';
          botones = {action: 'activateTeacher', text: 'Activar', classes: 'ml-1 btn-success btn-block'};
        }
        return {
          idPersona: p.idPersona,
          nombre: p.nombre,
          rut: p.rut,
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

  getAllStudents(){
    this.genServ.showSpinner();

    this.dataService.getAllStudents().subscribe(resp => {
      // console.log('jugadores', resp.data);
      this.listaAlumnos = resp.data.map(p => {
        let botones; let valido;
        if (p.vigente){
          valido = 'Vigente';
          botones = {action: 'desactivateStudent', text: 'Desactivar', classes: 'ml-1 btn-danger btn-block'};
        } else {
          valido = 'No Vigente';
          botones = {action: 'activateStudent', text: 'Activar', classes: 'ml-1 btn-success btn-block'};
        }
        return {
          idPersona: p.idPersona,
          nombre: p.nombre,
          rut: p.rut,
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

  addCarrer() {
    console.log('carrera agregada');
  }

  addPersona() {
    console.log('profesor agregada');
  }

  // addStudent() {
  //   console.log('alumno agregada');

  // }

  desactivate(id){
    if (this.rol === 'CARRERA'){
      console.log('desactivar CARRERA', id);
    }
    if (this.rol === 'PROFESOR'){
      console.log('desactivar PROFESOR', id);
    }
    if (this.rol === 'ALUMNO'){
      console.log('desactivar ALUMNO', id);
    }
    this.modalRef.hide();
    this.elemento = '';
    this.rol = '';
  }

  activate(id){
    console.log('activar', id);
    this.modalRef.hide();
    this.elemento = '';
    this.rol = '';
  }


  openModal(modal) {
    this.modalRef = this.modalService.show(
      modal,
      Object.assign({}, { class: 'modal-lg', ignoreBackdropClick: true,
      keyboard: false, })
    );
  }

  openModalCarrer(modalCarrer) {
    this.modalRef = this.modalService.show(
      modalCarrer,
      Object.assign({}, { class: 'modal-lg', ignoreBackdropClick: true,
      keyboard: false, })
    );
  }

  openModalPersona(modalPersona) {
    this.modalRef = this.modalService.show(
      modalPersona,
      Object.assign({}, { class: 'modal-lg', ignoreBackdropClick: true,
      keyboard: false, })
    );
  }

}
