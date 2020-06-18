import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import { DataService } from 'src/app/services/data.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { LoginService } from '../../services/login.service';
import { Jugadores, Grupos, Ciudades, Productos, Historial, Carrera } from 'src/app/interfaces/admin';
import { DTHeaderData, DTEvent } from 'src/app/interfaces/dataTable';
import { BsModalService, ModalDirective, BsModalRef } from 'ngx-bootstrap/modal';
import { DateTime } from 'luxon';
import { Persona } from '../../interfaces/admin';

@Component({
  selector: 'app-admin-juegos-detalle',
  templateUrl: './admin-juegos-detalle.component.html',
  styleUrls: ['./admin-juegos-detalle.component.scss']
})
export class AdminJuegosDetalleComponent implements OnInit {

  @ViewChild('modalAsignarJugadores', { static: true }) modalAsignarJugadores: ModalDirective;
  @ViewChild('modalPlayer', { static: true }) modalPlayer: ModalDirective;
  @ViewChild('modalStudentPlayer', { static: true }) modalStudentPlayer: ModalDirective;
  @ViewChild('modalGroup', { static: true }) modalGroup: ModalDirective;
  @ViewChild('modalCity', { static: true }) modalCity: ModalDirective;
  @ViewChild('modalProduct', { static: true }) modalProduct: ModalDirective;

  // ELEMENTOS DEL MODAL INFO
  @ViewChild('modal', { static: true }) modal: ModalDirective;
  public titulo = '';
  public mensaje = '';
  public tabs;
  public activo;
  public elemento;
  public grupo;
  modalRef: BsModalRef;


  public idJuego: number;
  public formData: FormGroup;
  public formConfiguracion: FormGroup;
  public formPlayer: FormGroup;
  public formGroup: FormGroup;
  public formCity: FormGroup;
  public formProduct: FormGroup;
  datosJuego: any = {};

  // Variables Select Profesor
  public items: any[] = [];
  listaProfesores: Persona[] = [];

  // Variables Select Carrera
  public itemsCarrera: any[] = [];

  // DATATABLE JUGADORES
  listaJugadores: Jugadores[] = [];
  listaJugadoresAsignar: Jugadores[] = [];

  headersJugadores: DTHeaderData[] = [
    { name: 'IDJ',      id: 'idJugador',   type: 'text', hide: true },
    { name: 'IDG',      id: 'idGrupo',     type: 'text', hide: true },
    { name: 'IDA',      id: 'idAlumno',    type: 'text', hide: true },
    { name: 'RUT',      id: 'rut',         type: 'text' },
    { name: 'Nombre',   id: 'nombre',      type: 'text' },
    { name: 'Grupo',    id: 'nombreGrupo', type: 'text' },
    { name: 'Estado',   id: 'estado',      type: 'text' },
    { name: 'Acciones', id: 'actions',     type: 'button'},
  ];

  // DATATABLE GRUPOS
  listaGrupos: Grupos[] = [];

  headersGrupos: DTHeaderData[] = [
    { name: 'ID',             id: 'idGrupo',      type: 'text', hide: true },
    { name: 'Nombre',         id: 'nombre',       type: 'text' },
    { name: 'Dinero',         id: 'dinero',       type: 'text' },
    { name: 'Bloques Extra',  id: 'bloquesExtra', type: 'text' },
    { name: 'Estado',         id: 'estado',       type: 'text' },
    { name: 'Acciones',       id: 'actions',      type: 'button'},
  ];

  // DATATABLE CIUDADES
  listaCiudades: Ciudades[] = [];

  headersCiudades: DTHeaderData[] = [
    { name: 'ID',             id: 'idCiudad',     type: 'text', hide: true },
    { name: 'Nombre',         id: 'nombre',       type: 'text' },
    { name: 'Hora Apertura',  id: 'horaApertura', type: 'text' },
    { name: 'Hora Cierre',    id: 'horaCierre',   type: 'text' },
    { name: 'Estado',         id: 'estado',       type: 'text' },
    { name: 'Acciones',       id: 'actions',      type: 'button'},
  ];

  // DATATABLE PRODUCTOS
  listaProductos: Productos[] = [];

  headersProductos: DTHeaderData[] = [
    { name: 'ID',       id: 'idProducto', type: 'text', hide: true },
    { name: 'Nombre',   id: 'nombre',     type: 'text' },
    { name: 'Bloques',  id: 'bloques',    type: 'text' },
    { name: 'Estado',   id: 'estado',     type: 'text' },
    { name: 'Acciones', id: 'actions',    type: 'button'},
  ];

  // DATATABLE HISTORIAL
  listaHistorial: Historial[] = [];

  headersHistorial: DTHeaderData[] = [
    { name: 'ID',      id: 'idHistorial',   type: 'text', hide: true },
    { name: 'RUT',      id: 'rut',         type: 'text' },
    { name: 'Nombre',   id: 'nombre',      type: 'text' },
    { name: 'Grupo',    id: 'nombreGrupo', type: 'text' },
    { name: 'Estado',   id: 'estado',      type: 'text' },
    { name: 'Acciones', id: 'actions',     type: 'button'},
  ];

  // DATATABLES ALUMNOS MODAL NEWSTUDENTPLAYER
  listaAlumnos: Persona[] = [];
  headersAlumnos: DTHeaderData[] = [
    { name: 'ID',       id: 'idPersona',   type: 'text', hide: true },
    { name: 'RUT',      id: 'rut',         type: 'text' },
    { name: 'Nombre',   id: 'nombre',      type: 'text' },
    { name: 'Estado',   id: 'estado',      type: 'text' },
    { name: 'Acciones', id: 'actions',     type: 'button'},
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private actRoute: ActivatedRoute,
    private genServ: GeneralService,
    private modalService: BsModalService,
    private dataService: DataService,
    private loginService: LoginService
  ) {
    this.formData = this.formBuilder.group({
      nombre: '',
      semestre: '',
      año: '',
      fechaInicio: new FormControl(),
      fechaTermino: new FormControl(),
    });

    this.formConfiguracion = this.formBuilder.group({
      dineroInicial: '',
      vecesCompraCiudadDia: '',
      maxBloquesCamion: '',
      maxBloquesBodega: '',
      precioBloqueExtra: '',
      freqCobroBloqueExtraDias: '',
      proxCobroBloqueExtra:  new FormControl (new Date()),
      valorImpuesto: ' ',
      freqCobroImpuestoDias: ' ',
      proxCobroImpuesto:  new FormControl (new Date()),
      freqRotacionLideresDias: ' ',
      proxRotacionLideres: new FormControl (new Date()),
      sePuedeComerciar: false,
      sePuedeComprarBloques: false,
      freqGeneracionReporteDias: '',
      proxGeneracionReporte: new FormControl (new Date()),
    });

    this.formPlayer = this.formBuilder.group({
      rut: '',
      nombres: '',
      apellidoP: '',
      apellidoM: '',
      correo: '',
      idCarrera: '',
    });

    this.formGroup = this.formBuilder.group({
      nombreGrupo: '',
      dineroActual: '',
    });

    this.formCity = this.formBuilder.group({
      nombreCiudad: '',
      horaAbre: new FormControl(),
      horaCierre: new FormControl(),
      idProfesor: '',
      descripcion: 'Por favor ingresar descripción correspondiente de la ciudad por el PROFESOR asignado',
    });

    this.formProduct = this.formBuilder.group({
      nombre: '',
      bloquesTotal: '',
    });

  }

  async ngOnInit(){
    this.genServ.showSpinner();
    this.idJuego = this.actRoute.snapshot.params.idJuego;
    await this.getDataGameById();
    await this.getPlayersByGameId();
    await this.getGroupsByGame();
    await this.getCitiesByGame();
    await this.getProductsByGame();
    await this.getAllTeachers();
    await this.getAllStudents();
    await this.getAllCarrers();
    this.genServ.hideSpinner();
  }


  async handleActions(e: DTEvent) {
    // console.log(e.id, e.action);
    switch (e.action) {
      case 'desactivatePlayer': {
        this.titulo = 'DESACTIVAR JUGADOR';
        this.mensaje = 'Esta acción desactivará el JUGADOR del sistema. Si desea continuar presione en DESACTIVAR';
        this.elemento = e.id; this.activo = false; this.tabs = 'PLAYER';
        this.openModal(this.modal);
        break;
      }
      case 'activatePlayer': {
        this.titulo = 'ACTIVAR JUGADOR';
        this.mensaje = 'Esta acción activará EL JUGADOR del sistema. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id; this.activo = true; this.tabs = 'PLAYER';
        this.openModal(this.modal);
        break;
      }
      case 'desactivateGroup': {
        this.titulo = 'DESACTIVAR GRUPO';
        this.mensaje = 'Esta acción desactivará el GRUPO del juego. Si desea continuar presione en DESACTIVAR';
        this.elemento = e.id; this.activo = false; this.tabs = 'GRUPO';
        this.openModal(this.modal);
        break;
      }
      case 'activateGroup': {
        this.titulo = 'ACTIVAR GRUPO';
        this.mensaje = 'Esta acción activará el GRUPO del juego. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id; this.activo = true; this.tabs = 'GRUPO';
        this.openModal(this.modal);
        break;
      }
      case 'desactivateCity': {
        this.titulo = 'DESACTIVAR CIUDAD';
        this.mensaje = 'Esta acción desactivará la CIUDAD del juego. Si desea continuar presione en DESACTIVAR';
        this.elemento = e.id; this.activo = false; this.tabs = 'CIUDAD';
        this.openModal(this.modal);
        break;
      }
      case 'activateCity': {
        this.titulo = 'ACTIVAR CIUDAD';
        this.mensaje = 'Esta acción activará la CIUDAD del juego. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id; this.activo = true; this.tabs = 'CIUDAD';
        this.openModal(this.modal);
        break;
      }
      case 'desactivateProduct': {
        this.titulo = 'DESACTIVAR PRODUCTO';
        this.mensaje = 'Esta acción desactivará el PRODUCTO del juego. Si desea continuar presione en DESACTIVAR';
        this.elemento = e.id; this.activo = false; this.tabs = 'PRODUCTO';
        this.openModal(this.modal);
        break;
      }
      case 'activateProduct': {
        this.titulo = 'ACTIVAR PRODUCTO';
        this.mensaje = 'Esta acción activará el PRODUCTO del juego. Si desea continuar presione en ACTIVAR';
        this.elemento = e.id; this.activo = true; this.tabs = 'PRODUCTO';
        this.openModal(this.modal);
        break;
      }
      case 'addStudentPlayer': {
        this.addStudentPlayer(e.id);
        break;
      }
      case 'verAsignarJugadores': {
        this.titulo = 'ASIGNAR JUGADORES A GRUPO';
        this.grupo = e.id;
        this.openModal(this.modalAsignarJugadores);
        break;
      }
      case 'asignarPlayer': {
        this.addPlayerToGroup(e.id, this.grupo);
        break;
      }
     }
   }

  getDataGameById(){
    this.genServ.showSpinner();
    this.dataService.getGameById(this.idJuego).subscribe(resp => {
      this.datosJuego = resp.data;
      // console.log('datos obtenidos', resp.data);
      const semestre = this.datosJuego.semestre.split(' ');
      let fechaTer; let proxBloque; let proxImp; let proxLider; let proxReporte;
      // console.log('semestre separado', semestre);
      if (!this.datosJuego.fechaTerminoFormat){fechaTer = ''; }else{fechaTer = new Date(this.datosJuego.fechaTerminoFormat); }
      if (!this.datosJuego.proxCobroBloqueExtraFormat){proxBloque = ''; }
      else{proxBloque = new Date(this.datosJuego.proxCobroBloqueExtraFormat); }

      if (!this.datosJuego.proxCobroImpuestoFormat){proxImp = ''; }
      else{proxImp = new Date(this.datosJuego.proxCobroImpuestoFormat); }

      if (!this.datosJuego.proxRotacionLideresFormat){proxLider = ''; }
      else{proxLider = new Date(this.datosJuego.proxRotacionLideresFormat); }

      if (!this.datosJuego.proxGeneracionReporteFormat){proxReporte = ''; }
      else{proxReporte = new Date(this.datosJuego.proxGeneracionReporteFormat); }

      this.formData = this.formBuilder.group({
        nombre: this.datosJuego.nombre,
        semestre: semestre[0],
        año: semestre[2],
        fechaInicio: new Date(this.datosJuego.fechaInicioFormat),
        fechaTermino: fechaTer,
      });

      let siComprar; let siComprarBloques;
      if (this.datosJuego.sePuedeComerciar){siComprar = true; }else{siComprar = false; }
      if (this.datosJuego.sePuedeComprarBloques){ siComprarBloques = true; }else { siComprarBloques = false; }

      this.formConfiguracion = this.formBuilder.group({
        dineroInicial: this.datosJuego.dineroInicial,
        vecesCompraCiudadDia: this.datosJuego.vecesCompraCiudadDia,
        maxBloquesCamion: this.datosJuego.maxBloquesCamion,
        maxBloquesBodega: this.datosJuego.maxBloquesBodega,
        precioBloqueExtra: this.datosJuego.precioBloqueExtra,
        freqCobroBloqueExtraDias: this.datosJuego.freqCobroBloqueExtraDias,
        proxCobroBloqueExtra: proxBloque,
        valorImpuesto: this.datosJuego.valorImpuesto,
        freqCobroImpuestoDias: this.datosJuego.freqCobroImpuestoDias,
        proxCobroImpuesto: proxImp,
        freqRotacionLideresDias: this.datosJuego.freqRotacionLideresDias,
        proxRotacionLideres: proxLider,
        sePuedeComerciar: siComprar,
        sePuedeComprarBloques: siComprarBloques,
        freqGeneracionReporteDias: this.datosJuego.freqGeneracionReporteDias,
        proxGeneracionReporte: proxReporte,
      });

      this.formGroup = this.formBuilder.group({
        nombreGrupo: '',
        dineroActual: this.datosJuego.dineroInicial
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
        // console.log(err);
      }
    });
    this.genServ.hideSpinner();
  }

  getPlayersByGameId(){
    this.dataService.getPlayersGameById(this.idJuego).subscribe(resp => {
      // console.log('players', resp.data);
      this.listaJugadores = resp.data.map(p => {
        let botones;
        if (p.vigente){
          botones = [{action: '',  text: 'Ver', classes: 'btn-info'},
                     {action: 'desactivatePlayer',    text: 'Desactivar', classes: ' ml-1 btn-danger'}];
        }else{
          botones = [{action: '',  text: 'Ver', classes: 'btn-info'},
                    {action: 'activatePlayer',    text: 'Activar', classes: ' ml-1 btn-success'}];
        }
        return {
          idAlumno: p.idAlumno,
          idGrupo: p.idGrupo,
          idJugador: p.idJugador,
          nombre: p.nombre,
          rut: p.rut,
          nombreGrupo: p.nombreGrupo,
          estado: p.vigente ? 'ACTIVO' : 'DESACTIVADO',
          actions: botones
        };
      });

      this.listaJugadoresAsignar = resp.data.map(p => {
        return {
          idAlumno: p.idAlumno,
          idGrupo: p.idGrupo,
          idJugador: p.idJugador,
          nombre: p.nombre,
          rut: p.rut,
          nombreGrupo: p.nombreGrupo,
          estado: p.vigente ? 'ACTIVO' : 'DESACTIVADO',
          actions: {action: 'asignarPlayer',  text: 'ASIGNAR', classes: 'btn-success'},
        };
      });
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
    });
  }

  getGroupsByGame(){

    this.dataService.getGroupsByGameId(this.idJuego).subscribe(resp => {
      // console.log('grupos', resp.data);
      this.listaGrupos = resp.data.map( g => {
        let botones;
        if (g.vigente){
          botones = [{action: '',  text: 'Ver', classes: 'btn-info'},
                    {action: 'verAsignarJugadores',  text: 'Asignar Jugadores', classes: 'ml-1 btn-warning'},
                    {action: 'desactivateGroup',    text: 'Desactivar Grupo', classes: ' ml-1 btn-danger'}];
        }else{
          botones = [{action: '',  text: 'Ver', classes: 'btn-info'},
                    {action: 'verAsignarJugadores',  text: 'Asignar Jugadores', classes: 'ml-1 btn-warning'},
                    {action: 'activateGroup',    text: 'Activar', classes: ' ml-1 btn-success'}];
        }
        return {
          idGrupo: g.idGrupo,
          nombre: g.nombreGrupo,
          dinero: g.dineroActual,
          bloquesExtra: g.bloquesExtra,
          estado: g.vigente ? 'ACTIVO' : 'DESACTIVADO',
          actions: botones
        };
      });
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
    });
  }

  getCitiesByGame(){
    this.dataService.getCitiesByGameId(this.idJuego).subscribe(resp => {
      // console.log('ciudades', resp.data);
      this.listaCiudades = resp.data.map( c => {
        let botones;
        if (c.vigente){
          botones = [{action: '',  text: 'Detalles', classes: 'btn-info'},
                        {action: 'desactivateCity',    text: 'Desactivar', classes: ' ml-1 btn-danger'}];
        }else{
          botones = [{action: '',  text: 'Detalles', classes: 'btn-info'},
                        {action: 'activateCity',    text: 'Activar', classes: ' ml-1 btn-success'}];
        }
        return {
          idCiudad: c.idCiudad,
          nombre: c.nombreCiudad,
          horaApertura: c.horaAbre,
          horaCierre: c.horaCierre,
          estado: c.vigente ? 'ACTIVA' : 'DESACTIVADA',
          actions: botones
        };
      });

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
    });
  }

  getProductsByGame(){
    this.dataService.getProductsByGameId(this.idJuego).subscribe(resp => {
      // console.log('productos', resp.data);
      this.listaProductos = resp.data.map( p => {
        let botones;
        if (p.vigente){
          botones = [{action: '',  text: 'Ver', classes: 'btn-info'},
                        {action: 'desactivateProduct',    text: 'Desactivar', classes: ' ml-1 btn-danger'}];
        }else{
          botones = [{action: '',  text: 'Ver', classes: 'btn-info'},
                        {action: 'activateProduct',    text: 'Activar', classes: ' ml-1 btn-success'}];
        }
        return {
          idProducto: p.idProducto,
          nombre: p.nombre,
          bloques: p.bloquesTotal,
          estado: p.vigente ? 'ACTIVO' : 'DESACTIVADO',
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
    });
  }

  // getRecordByGame(){
  //   this.dataService.getRecordByGameId(this.idJuego).subscribe(resp => {
  //     this.listaHistorial = resp.data.map( g => {
  //       let botones;
  //       if (g.estado){
  //         botones = [{action: '',  text: 'Ver', classes: 'btn-info'},
  //                     {action: '',    text: 'Desactivar', classes: ' ml-1 btn-danger'}];

  //       }else{
  //         botones = [{action: '',  text: 'Ver', classes: 'btn-info'},
  //                     {action: '',    text: 'Activar', classes: ' ml-1 btn-danger'}];
  //       }
  //       return {
  //         idHistorial: g.idHistorial,
  //         rut: g.rut,
  //         nombre: g.nombre,
  //         nombreGrupo: g.nombreGrupo,
  //         estado: g.estado ? 'CONCLUIDO' : 'EN EJECUCIÓN',
  //         actions: botones
  //       };
  //     });
  //   }, (err: ErrorResponse) => {
  //     if (err.status === 400) {
  //       switch (err.error.code) {
  //         case 2701: case 2803: case 2901: case 2902: case 2903: {
  //           this.loginService.setLogout();
  //           this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
  //           break;
  //         }
  //         default: {
  //           this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
  //         }
  //       }
  //     } else {
  //       this.genServ.showToast("ERROR DESCONOCIDO",`Error interno del servidor.`,"danger");
  //       console.log(err);
  //     }
  //   });
  // }

  back(){
    this.router.navigate(['admin/juegos']);
  }

  changeDataGeneral(){
    let semestreValido = false;
    if (this.formData.value.semestre === 1 + '°' || this.formData.value.semestre === 2 + '°' ){
      this.formData.value.semestre = this.formData.value.semestre + ' Semestre ' + this.formData.value.año;
      semestreValido = true;
    }else if (!isNaN(this.formData.value.semestre)
              && Number(this.formData.value.semestre) === 1
              || Number(this.formData.value.semestre) === 2 ){
        this.formData.value.semestre = this.formData.value.semestre + '° Semestre ' + this.formData.value.año;
        semestreValido = true;
    }else{
      return this.genServ.showToast('Error en Formato de semestre', `Ingrese de la forma 1 o 1°, 2 o 2°.`, 'warning');
    }

    if (semestreValido){
      this.genServ.showSpinner();
      this.dataService.changeDataGeneral(this.idJuego, this.formData.value).subscribe( d => {
        this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
        this.formData.reset(); // Todos los valores a null del formulario
        this.genServ.hideSpinner();
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

  changeDataConfiguration(){
    // console.log('datos enviados', this.formConfiguracion.value );
    this.genServ.showSpinner();
    this.dataService.changeDataConfiguration(this.idJuego, this.formConfiguracion.value).subscribe( d => {
      this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
      this.formConfiguracion.reset(); // Todos los valores a null del formulario
      this.genServ.hideSpinner();
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

  poderComprar(valor: boolean){
    this.formConfiguracion.value.sePuedeComprarBloques = !this.formConfiguracion.value.sePuedeComprarBloques;
    // console.log('comprar', this.comprar);
  }

  poderComerciar(valor: boolean){
    this.formConfiguracion.value.sePuedeComerciar = !this.formConfiguracion.value.sePuedeComerciar;
    // console.log('comerciar', this.comerciar);
  }

  addNewPlayer(){
    this.genServ.showSpinner();
    this.dataService.addNewPlayer( this.idJuego, this.formPlayer.value).subscribe( d => {
      this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
      this.formGroup.reset(); // Todos los valores a null del formulario
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

  addStudentPlayer(id){
    this.genServ.showSpinner();
    this.dataService.addStudentPlayer( this.idJuego, id).subscribe( d => {
      this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
      this.formGroup.reset(); // Todos los valores a null del formulario
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

  addPlayerToGroup(idJugador, idGrupo){
    this.genServ.showSpinner();
    this.dataService.addPlayerToGroup( this.idJuego, idJugador, idGrupo).subscribe( d => {
      this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
      this.genServ.hideSpinner();
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

  addGroup() {
    this.genServ.showSpinner();
    this.dataService.addGroup( this.idJuego, this.formGroup.value).subscribe( d => {
      this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
      this.formGroup.reset(); // Todos los valores a null del formulario
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

  addCity(){
    let open = DateTime.fromJSDate(this.formCity.value.horaAbre);
    let close = DateTime.fromJSDate(this.formCity.value.horaCierre);

    if (open > close) {
      this.genServ.showToast('ERROR','La hora de apertura no puede ser mayor que la hora de cierre','danger');
      return;
    }

    this.formCity.value.horaAbre = open.toFormat('HH:mm:ss'),
    this.formCity.value.horaCierre = close.toFormat('HH:mm:ss')

    this.dataService.addCity(this.idJuego , this.formCity.value).subscribe(resp => {
      this.genServ.showToast('CORRECTO','Ciudad creada exitosamente','success');
      this.formCity.reset();
      this.modalRef.hide();
      this.ngOnInit();
      this.genServ.hideSpinner();
    }, (err: ErrorResponse) => {
      if (err.status === 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
            break;
          }
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

  addProduct() {
    this.genServ.showSpinner();
    this.dataService.addProduct( this.idJuego, this.formProduct.value).subscribe( d => {
      this.genServ.showToast("CORRECTO",`${d.msg}.`,"success");
      this.formProduct.reset(); // Todos los valores a null del formulario
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

  desactivate(id){
    if (this.tabs === 'PLAYER'){
      this.genServ.showSpinner();
      this.dataService.desactivatePlayer(id).subscribe( d => {
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
        this.modalRef.hide();
      });
    }
    if (this.tabs === 'GRUPO'){
      // console.log('desactivar GRUPO', id);
      this.genServ.showSpinner();
      this.dataService.desactivateGroup(id).subscribe( d => {
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
        this.modalRef.hide();
      });
    }
    if (this.tabs === 'CIUDAD'){
      // console.log('desactivar CIUDAD', id);
      this.genServ.showSpinner();
      this.dataService.desactivateCity(id).subscribe( d => {
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
        this.modalRef.hide();
      });
    }
    if (this.tabs === 'PRODUCTO'){
      // console.log('desactivar PRODUCTO', id);
      this.genServ.showSpinner();
      this.dataService.desactivateProduct(id).subscribe( d => {
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
        this.modalRef.hide();
      });
    }
    this.elemento = '';
    this.tabs = '';
  }

  activate(id){
    if (this.tabs === 'PLAYER'){
      // console.log('activar PLAYER', id);
      this.genServ.showSpinner();
      this.dataService.activatePlayer(id).subscribe( d => {
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
        this.modalRef.hide();
      });
    }
    if (this.tabs === 'GRUPO'){
      // console.log('activar GRUPO', id);
      this.genServ.showSpinner();
      this.dataService.activateGroup(id).subscribe( d => {
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
        this.modalRef.hide();
      });
    }
    if (this.tabs === 'CIUDAD'){
      // console.log('activar CIUDAD', id);
      this.genServ.showSpinner();
      this.dataService.activateCity(id).subscribe( d => {
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
        this.modalRef.hide();
      });
    }
    if (this.tabs === 'PRODUCTO'){
      // console.log('activar PRODUCTO', id);
      this.genServ.showSpinner();
      this.dataService.activateProduct(id).subscribe( d => {
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
        this.modalRef.hide();
      });
    }
    this.elemento = '';
    this.tabs = '';
  }

  async openModal(modal) {
    this.modalRef = this.modalService.show(
      modal,
      Object.assign({}, { class: 'modal-lg', ignoreBackdropClick: true,
      keyboard: false, })
    );
  }

  getAllTeachers(){
    this.dataService.getAllTeachers().subscribe(resp => {
      this.items = [];
      // console.log('jugadores', resp.data);
      this.listaProfesores = resp.data.map(p => {
        this.items.push({
          idProfesor: p.idPersona,
          nombreProfesor : p.rut + ' - ' + p.nombre});
        return {
          idPersona: p.idPersona,
          nombre: p.nombre,
          rut: p.rut,
          estado: p.vigente,
        };
      });
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
    });
  }

  getAllStudents(){
    this.genServ.showSpinner();

    this.dataService.getAllStudentsToPlayer(this.idJuego).subscribe(resp => {
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
          actions: {action: 'addStudentPlayer', text: 'Asignar', classes: 'btn-success btn-block'}
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

  getAllCarrers(){
    this.genServ.showSpinner();
    this.itemsCarrera = [];
    this.dataService.getAllCarrers().subscribe(resp => {
      // Lista de Carreras del Select para agregar Alumno
      resp.data.map(p => {
        this.itemsCarrera.push({
          idCarrera: p.idCarrera,
          nombreCarrera : p.nombreCarrera});
      // ------------------------------------------------
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

}
