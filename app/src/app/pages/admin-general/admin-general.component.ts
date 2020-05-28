import { Component, OnInit } from '@angular/core';
import { Carrera } from 'src/app/interfaces/admin';
import { Persona } from '../../interfaces/admin';
import { GeneralService } from 'src/app/services/general.service';
import { DataService } from 'src/app/services/data.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { LoginService } from '../../services/login.service';
import { DTHeaderData, DTEvent } from 'src/app/interfaces/dataTable';

@Component({
  selector: 'app-admin-general',
  templateUrl: './admin-general.component.html',
  styleUrls: ['./admin-general.component.scss']
})
export class AdminGeneralComponent implements OnInit {

  public activadoCarrera = false;
  public activadoProfesor = false;
  public activadoAlumno = false;

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
              private loginService: LoginService) { }

  async ngOnInit(){
    await this.getAllCarrers();
    await this.getAllTeachers();
    await this.getAllStudents();

  }

  handleActions (e:DTEvent) {
    console.log(e.id, e.action);

    switch (e.action) {
      case 'showTicket':
        // DO SOMETHING
        break;
    }
    
  }

  getAllCarrers(){
    this.genServ.showSpinner();

    this.dataService.getAllCarrers().subscribe(resp => {
      console.log('carreras', resp.data);
      this.listaCarreras = resp.data.map(p => {
        let valido;
        if (p.vigente){
          valido = 'Vigente';
        } else {
          valido = 'No Vigente';
        }
        return {
          idCarrera: p.idCarrera,
          nombre: p.nombreCarrera,
          estado: valido,
          actions: [{action: 'showTicket', text: 'Desactivar', classes: 'btn-info'},
                    {action: 'showTicket', text: 'Activar', classes: 'ml-1 btn-success'}]
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
        let valido;
        if (p.vigente){
          valido = 'Vigente';
        } else {
          valido = 'No Vigente';
        }
        return {
          idPersona: p.idPersona,
          nombre: p.nombre,
          rut: p.rut,
          estado: valido,
          actions: [{action: 'showTicketTeacher', text: 'Desactivar', classes: 'btn-info'},
            {action: 'showTicketTeacher', text: 'Activar', classes: ' ml-1 btn-success'}]
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
        let valido;
        if (p.vigente){
          valido = 'Vigente';
        } else {
          valido = 'No Vigente';
        }
        return {
          idPersona: p.idPersona,
          nombre: p.nombre,
          rut: p.rut,
          estado: valido,
          actions: [{action: 'showTicketStudents', text: 'Desactivar', classes: 'btn-info'},
            {action: 'showTicketStudents', text: 'Activar', classes: ' ml-1 btn-success'}]
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

  addCarrer () {

  }

  addTeacher () {

  }

  addStudent () {

  }

}
