import { Component, OnInit } from '@angular/core';
import { DataTableHeaderData } from 'src/app/components/datatable/datatable.component';
import { Carrera } from 'src/app/interfaces/admin';
import { Persona } from '../../interfaces/admin';
import { GeneralService } from 'src/app/services/general.service';
import { DataService } from 'src/app/services/data.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { LoginService } from '../../services/login.service';

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

  headersCarrera: DataTableHeaderData[] = [
    { name: 'ID',       id: 'idCarrera',   type: 'text', hide: true },
    { name: 'Nombre',   id: 'nombre',      type: 'text' },
    { name: 'Estado',   id: 'estado',      type: 'text' },
    { name: 'Acciones', id: 'actions',     type: 'button',
            props: [{action: this.showTicket, text: 'Desactivar', classes: 'btn-info'},
                    {action: this.showTicket, text: 'Activar', classes: 'ml-1 btn-success'}]
    },
  ];

  // DATATABLES PROFESORES
  listaProfesores: Persona[] = [];

  headersProfesores: DataTableHeaderData[] = [
    { name: 'ID',       id: 'idCarrera',   type: 'text', hide: true },
    { name: 'Nombre',   id: 'nombre',      type: 'text' },
    { name: 'Estado',   id: 'estado',      type: 'text' },
    { name: 'Acciones', id: 'actions',     type: 'button',
            props: [{action: this.showTicket, text: 'Desactivar', classes: 'btn-info'},
                    {action: this.showTicket, text: 'Activar', classes: ' ml-1 btn-success'}]
    },
  ];

  // DATATABLES ALUMNOS
  listaAlumnos: Persona[] = [];

  headersAlumnos: DataTableHeaderData[] = [
    { name: 'ID',       id: 'idPersona',   type: 'text', hide: true },
    { name: 'RUT',      id: 'rut',         type: 'text' },
    { name: 'Nombre',   id: 'nombre',      type: 'text' },
    { name: 'Estado',   id: 'estado',      type: 'text' },
    { name: 'Acciones', id: 'actions',     type: 'button',
            props: [{action: this.showTicket, text: 'Desactivar', classes: 'btn-info'},
                    {action: this.showTicket, text: 'Activar', classes: ' ml-1 btn-success'}]
    },
  ];

  constructor(private genServ: GeneralService,
              private dataService: DataService,
              private loginService: LoginService) { }

  async ngOnInit(){
    await this.getAllCarrers();
    await this.getAllTeachers();
    await this.getAllStudents();

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

  // Cambiar funcion luego de implementar
  showTicket(){

  }

  addCarrer(){

  }

  addTeacher(){

  }

  addStudent(){

  }


}
