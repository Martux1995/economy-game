import { Component, OnInit, ViewChild } from '@angular/core';
import { Carrera } from 'src/app/interfaces/admin';
import { Persona } from '../../interfaces/admin';
import { GeneralService } from 'src/app/services/general.service';
import { DataService } from 'src/app/services/data.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { LoginService } from '../../services/login.service';
import { DTHeaderData, DTEvent } from 'src/app/interfaces/dataTable';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  public elemento;
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

  public carrerForm: FormGroup;
  public userForm: FormGroup;
  public esProfesor = true; // Si es true quiere decir que es profesor, Dato estatico NO MODIFICAR
  public esAlumno = false; // Si es false quiere decir que es alumno, Dato estatico NO MODIFICAR
  public editar;

  // Variables Select
  public items: any[] = [];

  constructor(private genServ: GeneralService,
              private dataService: DataService,
              private loginService: LoginService,
              private modalService: BsModalService,
              private formBuilder: FormBuilder)
  {
    this.carrerForm = this.formBuilder.group({ nombreCarrera: ''});
    this.userForm = this.formBuilder.group({
      rut: '',
      nombres: '',
      apellidoP: '',
      apellidoM: '',
      correo: '',
      idCarrera: '',
    });
  }

  async ngOnInit(){
    await this.getAllCarrers();
    await this.getAllTeachers();
    await this.getAllStudents();

  }

  async handleActions(e: DTEvent) {
    console.log(e.id, e.action);

    switch (e.action) {
      case 'desactivateCarrer': {
        this.titulo = 'DESACTIVAR CARRERA';
        this.mensaje = 'Esta acción desactivará la carrera del sistema. Si desea continuar presione en DESACTIVAR';
        this.elemento = e.id; this.activo = false; this.rol = 'CARRERA';
        this.openModal(this.modal);
        break;
      }
      case 'activateCarrer': {
        this.titulo = 'ACTIVAR CARRERA';
        this.mensaje = 'Esta acción activará la carrera del sistema. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id; this.rol = 'CARRERA'; this.activo = true;
        this.openModal(this.modal);
        break;
      }
      case 'desactivateTeacher': {
        this.titulo = 'DESACTIVAR PROFESOR';
        this.mensaje = 'Esta acción desactivará el profesor del sistema. Si desea continuar presione en DESACTIVAR';
        this.elemento = e.id; this.rol = 'PROFESOR'; this.activo = false;
        this.openModal(this.modal);
        break;
      }
      case 'activateTeacher': {
        this.titulo = 'ACTIVAR PROFESOR';
        this.mensaje = 'Esta acción activará el profesor del sistema. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id; this.rol = 'PROFESOR'; this.activo = true;
        this.openModal(this.modal);
        break;
      }
      case 'desactivateStudent': {
        this.titulo = 'DESACTIVAR ALUMNO';
        this.mensaje = 'Esta acción desactivará el alumno del sistema. Si desea continuar presione en DESACTIVAR';
        this.elemento = e.id; this.rol = 'ALUMNO'; this.activo = false;
        this.openModal(this.modal);
        break;
      }
      case 'activateStudent': {
        this.titulo = 'ACTIVAR ALUMNO';
        this.mensaje = 'Esta acción activará el alumno del sistema. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id; this.rol = 'ALUMNO'; this.activo = true;
        this.openModal(this.modal);
        break;
      }
      case 'editCarrer': {
        this.titulo = 'EDITAR CARRERA';
        this.mensaje = 'Esta acción desactivará el alumno del sistema. Si desea continuar presione en DESACTIVAR';
        this.elemento = e.id; this.rol = 'ALUMNO'; this.editar = true;
        await this.getCarrerById(e.id);
        this.openModalCarrer(this.modalCarrer);
        break;
      }
      case 'editTeacher': {
        this.titulo = 'EDITAR PERSONA';
        this.mensaje = 'Esta acción activará el alumno del sistema. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id; this.rol = 'TEACHER'; this.editar = true;
        await this.getTeacherById(e.id);
        this.openModalPersona(this.modalPersona, this.esProfesor);
        break;
      }
      case 'editStudent': {
        this.titulo = 'EDITAR PERSONA';
        this.mensaje = 'Esta acción activará el alumno del sistema. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id; this.rol = 'ALUMNO'; this.editar = true;
        await this.getStudentById(e.id);
        this.openModalPersona(this.modalPersona, this.esAlumno);
        break;
      }
    }

  }

  getAllCarrers(){
    this.genServ.showSpinner();

    this.dataService.getAllCarrers().subscribe(resp => {
      console.log('carreras', resp.data);
      // Lista de Carreras del Select para agregar Alumno
      this.listaCarreras = resp.data.map(p => {
        this.items.push({
          idCarrera: p.idCarrera,
          nombreCarrera : p.nombreCarrera});
      // ------------------------------------------------
        let botones; let valido;
        if (p.vigente){
          valido = 'Vigente';
          botones = [ {action: 'editCarrer', text: 'Editar', classes: 'btn-info btn-block'},
                      {action: 'desactivateCarrer', text: 'Desactivar', classes: 'ml-1 btn-danger btn-block'}];
        } else {
          valido = 'No Vigente';
          botones = [ {action: 'editCarrer', text: 'Editar', classes: 'btn-info btn-block'},
                      {action: 'activateCarrer', text: 'Activar', classes: 'ml-1 btn-success btn-block'}];
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
          botones = [{action: 'editTeacher', text: 'Editar', classes: 'btn-info btn-block'},
                    {action: 'desactivateTeacher', text: 'Desactivar', classes: 'ml-1 btn-danger btn-block'}];
        } else {
          valido = 'No Vigente';
          botones = [{action: 'editTeacher', text: 'Editar', classes: 'btn-info btn-block'},
                    {action: 'activateTeacher', text: 'Activar', classes: 'ml-1 btn-success btn-block'}];
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
          botones = [{action: 'editStudent', text: 'Editar', classes: 'btn-info btn-block'},
                    {action: 'desactivateStudent', text: 'Desactivar', classes: 'ml-1 btn-danger btn-block'}];
        } else {
          valido = 'No Vigente';
          botones = [{action: 'editStudent', text: 'Editar', classes: 'btn-info btn-block'},
                    {action: 'activateStudent', text: 'Activar', classes: 'ml-1 btn-success btn-block'}];
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

  getCarrerById(id){
    this.genServ.showSpinner();

    this.dataService.getDataCarrerById(id).subscribe(resp => {
      // console.log('carrera por id', resp.data.nombreCarrera);
      this.carrerForm = this.formBuilder.group({ nombreCarrera :  resp.data.nombreCarrera});
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

  getTeacherById(id){
    this.genServ.showSpinner();

    this.dataService.getDataTeacherById(id).subscribe(resp => {
      // console.log('Profesor por id', resp.data);
      this.userForm = this.formBuilder.group({
        rut: resp.data.rut,
        nombres: resp.data.nombre,
        apellidoP: resp.data.apellidoP,
        apellidoM: resp.data.apellidoM,
        correo: resp.data.correoUcn,
        idCarrera: '',
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

  getStudentById(id){
    this.genServ.showSpinner();

    this.dataService.getDataStudentById(id).subscribe(resp => {
      // console.log('Estuadiante por id', resp.data);
      this.userForm = this.formBuilder.group({
        rut: resp.data.rut,
        nombres: resp.data.nombre,
        apellidoP: resp.data.apellidoP,
        apellidoM: resp.data.apellidoM,
        correo: resp.data.correoUcn,
        idCarrera: resp.data.idCarrera,
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
    this.genServ.showSpinner();
    this.dataService.addCarrer(this.carrerForm.value).subscribe( d => {
      this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
      this.carrerForm.reset(); // Todos los valores a null del formulario
      this.genServ.hideSpinner();
      this.modalRef.hide();
      this.ngOnInit();
    }, (err: ErrorResponse) => {
      if (err.status === 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
            break;
          }
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            this.loginService.setLogout();
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

  editCarrer(id){
    this.genServ.showSpinner();
    this.dataService.editCarrer(id, this.carrerForm.value).subscribe( d => {
      this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
      this.carrerForm.reset(); // Todos los valores a null del formulario
      this.genServ.hideSpinner();
      this.editar = false;
      this.modalRef.hide();
      this.ngOnInit();
    }, (err: ErrorResponse) => {
      if (err.status === 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
            break;
          }
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            this.loginService.setLogout();
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

  addPersona() {
    if (this.rol === 'PROFESOR'){
      this.genServ.showSpinner();
      this.dataService.addTeacher(this.userForm.value).subscribe( d => {
        this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
        console.log('PROFESOR agregada', this.userForm.value);
        this.userForm.reset(); // Todos los valores a null del formulario
        this.genServ.hideSpinner();
        this.modalRef.hide();
        this.ngOnInit();
      }, (err: ErrorResponse) => {
        if (err.status === 400) {
          switch (err.error.code) {
            case 2501: {
              this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
              break;
            }
            case 2701: case 2803: case 2901: case 2902: case 2903: {
              this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
              this.loginService.setLogout();
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
    if (this.rol === 'ALUMNO'){
      this.genServ.showSpinner();
      this.dataService.addStudent(this.userForm.value).subscribe( d => {
        this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
        console.log('ALUMNO agregada', this.userForm.value);
        this.userForm.reset(); // Todos los valores a null del formulario
        this.genServ.hideSpinner();
        this.modalRef.hide();
        this.ngOnInit();
      }, (err: ErrorResponse) => {
        if (err.status === 400) {
          switch (err.error.code) {
            case 2501: {
              this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
              break;
            }
            case 2701: case 2803: case 2901: case 2902: case 2903: {
              this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
              this.loginService.setLogout();
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
  }

  editPerson(id){
    if (this.rol === 'PROFESOR'){
      this.genServ.showSpinner();
      this.dataService.editTeacher(id, this.userForm.value).subscribe( d => {
        this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
        this.userForm.reset(); // Todos los valores a null del formulario
        this.genServ.hideSpinner();
        this.editar = false;
        this.modalRef.hide();
        this.ngOnInit();
      }, (err: ErrorResponse) => {
        if (err.status === 400) {
          switch (err.error.code) {
            case 2501: {
              this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
              break;
            }
            case 2701: case 2803: case 2901: case 2902: case 2903: {
              this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
              this.loginService.setLogout();
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
    if (this.rol === 'ALUMNO'){
      this.genServ.showSpinner();
      this.dataService.editStudent(id, this.userForm.value).subscribe( d => {
        this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
        this.userForm.reset(); // Todos los valores a null del formulario
        this.genServ.hideSpinner();
        this.editar = false;
        this.modalRef.hide();
        this.ngOnInit();
      }, (err: ErrorResponse) => {
        if (err.status === 400) {
          switch (err.error.code) {
            case 2501: {
              this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
              break;
            }
            case 2701: case 2803: case 2901: case 2902: case 2903: {
              this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
              this.loginService.setLogout();
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
  }

  desactivate(id){
    if (this.rol === 'CARRERA'){
      console.log('desactivar CARRERA', id);
      this.genServ.showSpinner();
      this.dataService.desactivateCarrer(id).subscribe( d => {
        this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
        this.genServ.hideSpinner();
        this.modalRef.hide();
        this.ngOnInit();
      }, (err: ErrorResponse) => {
        if (err.status === 400) {
          switch (err.error.code) {
            case 2701: case 2803: case 2901: case 2902: case 2903: {
              this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
              this.loginService.setLogout();
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
    if (this.rol === 'PROFESOR'){
      console.log('desactivar PROFESOR', id);
      console.log('desactivar CARRERA', id);
      this.genServ.showSpinner();
      this.dataService.desactivateTeacher(id).subscribe( d => {
        this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
        this.genServ.hideSpinner();
        this.modalRef.hide();
        this.ngOnInit();
      }, (err: ErrorResponse) => {
        if (err.status === 400) {
          switch (err.error.code) {
            case 2701: case 2803: case 2901: case 2902: case 2903: {
              this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
              this.loginService.setLogout();
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
    if (this.rol === 'ALUMNO'){
      console.log('desactivar ALUMNO', id);
      console.log('desactivar CARRERA', id);
      this.genServ.showSpinner();
      this.dataService.desactivateStudent(id).subscribe( d => {
        this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
        this.genServ.hideSpinner();
        this.modalRef.hide();
        this.ngOnInit();
      }, (err: ErrorResponse) => {
        if (err.status === 400) {
          switch (err.error.code) {
            case 2701: case 2803: case 2901: case 2902: case 2903: {
              this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
              this.loginService.setLogout();
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
    this.modalRef.hide();
    this.elemento = '';
    this.rol = '';
  }

  activate(id){
    if (this.rol === 'CARRERA'){
      console.log('activar CARRERA', id);
      this.genServ.showSpinner();
      this.dataService.activateCarrer(id).subscribe( d => {
        this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
        this.genServ.hideSpinner();
        this.modalRef.hide();
        this.ngOnInit();
      }, (err: ErrorResponse) => {
        if (err.status === 400) {
          switch (err.error.code) {
            case 2701: case 2803: case 2901: case 2902: case 2903: {
              this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
              this.loginService.setLogout();
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
    if (this.rol === 'PROFESOR'){
      console.log('activar PROFESOR', id);
      this.genServ.showSpinner();
      this.dataService.activateTeacher(id).subscribe( d => {
        this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
        this.genServ.hideSpinner();
        this.modalRef.hide();
        this.ngOnInit();
      }, (err: ErrorResponse) => {
        if (err.status === 400) {
          switch (err.error.code) {
            case 2701: case 2803: case 2901: case 2902: case 2903: {
              this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
              this.loginService.setLogout();
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
    if (this.rol === 'ALUMNO'){
      console.log('activar ALUMNO', id);
      this.genServ.showSpinner();
      this.dataService.activateStudent(id).subscribe( d => {
        this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
        this.genServ.hideSpinner();
        this.modalRef.hide();
        this.ngOnInit();
      }, (err: ErrorResponse) => {
        if (err.status === 400) {
          switch (err.error.code) {
            case 2701: case 2803: case 2901: case 2902: case 2903: {
              this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
              this.loginService.setLogout();
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

  closeModal(){
    this.editar = false;
    this.modalRef.hide();
    this.carrerForm.reset();
    this.userForm.reset();
  }

  openModalPersona(modalPersona, persona: boolean) {
    if (persona){
      this.rol = 'PROFESOR';
    } else {
      this.rol = 'ALUMNO';
    }
    this.modalRef = this.modalService.show(
      modalPersona,
      Object.assign({}, { class: 'modal-lg', ignoreBackdropClick: true,
      keyboard: false, })
    );
  }

}
