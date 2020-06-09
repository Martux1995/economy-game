import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import { DataService } from 'src/app/services/data.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { LoginService } from '../../services/login.service';
import { Jugadores, Grupos, Ciudades, Productos, Historial } from 'src/app/interfaces/admin';
import { DTHeaderData, DTEvent } from 'src/app/interfaces/dataTable';
import { BsModalService, ModalDirective, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-admin-juegos-detalle',
  templateUrl: './admin-juegos-detalle.component.html',
  styleUrls: ['./admin-juegos-detalle.component.scss']
})
export class AdminJuegosDetalleComponent implements OnInit {

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
  modalRef: BsModalRef;


  public idJuego: number;
  public formData: FormGroup;
  public formConfiguracion: FormGroup;
  public formGroup: FormGroup;
  public formCity: FormGroup;
  public formProduct: FormGroup;
  datosJuego: any = {};

  // DATATABLE JUGADORES
  listaJugadores: Jugadores[] = [];

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
      fechaInicio: new FormControl(new Date()),
      fechaFin: new FormControl(new Date()),
    });

    this.formConfiguracion = this.formBuilder.group({
      dineroInicial: '',
      cantCompras: '',
      maxCamion: '',
      maxBodega: '',
      precioBloqueEx: '',
      diasBloqueEx: '',
      fechaCobroBloqueEx: new FormControl(new Date()),
      valorImp: '',
      frecCobroImp: '',
      fechaProxCobroImp: new FormControl(new Date()),
      frecRotaLideres: '',
      fechaProxRotaLideres: new FormControl(new Date()),
    });

    this.formGroup = this.formBuilder.group({
      nombreGrupo: '',
      dinero: '',
      bloquesExtra: '',
      estado: false,
    });

    this.formCity = this.formBuilder.group({
      nombreCiudad: '',
      horaAbre: new FormControl(new Date()),
      horaCierre: new FormControl(new Date()),
      estado: false,
    });

    this.formProduct = this.formBuilder.group({
      nombreProducto: '',
      bloques: '',
      estado: false,
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
    this.genServ.hideSpinner();
  }


  handleActions(e: DTEvent) {
    console.log(e.id, e.action);
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
     }
   }

  getDataGameById(){
    this.dataService.getGameById(this.idJuego).subscribe(resp => {
      this.datosJuego = resp.data;
      console.log('datos obtenidos', resp.data);
      this.formData = this.formBuilder.group({
        nombre: this.datosJuego.nombre,
        semestre: this.datosJuego.semestre,
        año: '',
        fechaInicio: new Date(this.datosJuego.fechaInicioFormat).toLocaleDateString(),
        fechaFin: new Date(this.datosJuego.fechaFinFormat).toLocaleDateString(),
      });

      this.formConfiguracion = this.formBuilder.group({
        dineroInicial: this.datosJuego.dineroInicial,
        cantCompras: this.datosJuego.vecesCompraCiudadDia,
        maxCamion: this.datosJuego.maxBloquesCamion,
        maxBodega: this.datosJuego.maxBloquesBodega,
        precioBloqueEx: this.datosJuego.precioBloqueExtra,
        diasBloqueEx: this.datosJuego.freqCobroBloqueExtraDias,
        fechaCobroBloqueEx: new Date(this.datosJuego.proxCobroBloqueExtraFormat).toLocaleDateString(),
        valorImp: this.datosJuego.valorImpuesto,
        frecCobroImp: this.datosJuego.freqCobroImpuestoDias,
        fechaProxCobroImp: new Date(this.datosJuego.proxCobroImpuestoFormat).toLocaleDateString(),
        frecRotaLideres: this.datosJuego.freqRotacionLideresDias,
        fechaProxRotaLideres: new Date(this.datosJuego.proxRotacionLideresFormat).toLocaleDateString(),
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

  getPlayersByGameId(){
    this.dataService.getPlayersGameById(this.idJuego).subscribe(resp => {
      console.log('players', resp.data);
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
      console.log('grupos', resp.data);
      this.listaGrupos = resp.data.map( g => {
        let botones;
        if (g.vigente){
          botones = [{action: '',  text: 'Ver', classes: 'btn-info'},
                     {action: 'desactivateGroup',    text: 'Desactivar Grupo', classes: ' ml-1 btn-danger'}];
        }else{
          botones = [{action: '',  text: 'Ver', classes: 'btn-info'},
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
      console.log('ciudades', resp.data);
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
      console.log('productos', resp.data);
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
    console.log('datos generales', this.formData.value);
  }

  changeDataConfiguration(){
    console.log('datos configuracion', this.formConfiguracion.value);
  }

  poderComprar($event){

  }

  poderComerciar($event){

  }

  rotacion($event){

  }

  addPlayer(){
    // console.log('datos grupo', this.formGroup.value);
  }

  addGroup(){
    console.log('datos grupo', this.formGroup.value);
  }

  addCity(){
    console.log('datos ciudad', this.formCity.value);
  }

  addProduct(){
    console.log('datos productos', this.formProduct.value);
  }

  addRecord(){
    // console.log('datos grupo', this.formGroup.value);
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
      console.log('desactivar GRUPO', id);
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
      console.log('desactivar CIUDAD', id);
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
      console.log('desactivar PRODUCTO', id);
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
      console.log('activar PLAYER', id);
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
      console.log('activar GRUPO', id);
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
      console.log('activar CIUDAD', id);
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
      console.log('activar PRODUCTO', id);
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

  openModal(modal) {
    this.modalRef = this.modalService.show(
      modal,
      Object.assign({}, { class: 'modal-lg', ignoreBackdropClick: true,
      keyboard: false, })
    );
  }

}
