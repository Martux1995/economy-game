import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import { DataService } from 'src/app/services/data.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { LoginService } from '../../services/login.service';
import { Jugadores } from 'src/app/interfaces/admin';
import { DataTableHeaderData } from 'src/app/components/datatable/datatable.component';

@Component({
  selector: 'app-admin-juegos-detalle',
  templateUrl: './admin-juegos-detalle.component.html',
  styleUrls: ['./admin-juegos-detalle.component.scss']
})
export class AdminJuegosDetalleComponent implements OnInit {

  public idJuego: number;
  public formData: FormGroup;
  public formConfiguracion: FormGroup;
  datosJuego: any = {};

  public vigente = false;
  
  // DATATABLE JUGADORES
  listaJugadores: Jugadores[] = [];

  headersPlayers: DataTableHeaderData[] = [
    { name: 'IDJ',      id: 'idJugador',   type: 'text', hide: true },
    { name: 'IDG',      id: 'idGrupo',     type: 'text', hide: true },
    { name: 'IDA',      id: 'idAlumno',    type: 'text', hide: true },
    { name: 'RUT',      id: 'rut',         type: 'text' },
    { name: 'Nombre',   id: 'nombre',      type: 'text' },
    { name: 'Grupo',    id: 'nombreGrupo', type: 'text' },
    { name: 'Estado',   id: 'estado',      type: 'text' },
    { name: 'Acciones', id: 'actions',     type: 'button',
            props: [{action: this.changeGroup, text: 'Cambiar Grupo', classes: 'btn-info'},
                    {action: this.changeGroup, text: 'Activar', classes: ' ml-1 btn-success'}]
    },
  ];

  constructor( private router: Router,
               private formBuilder: FormBuilder,
               private actRoute: ActivatedRoute,
               private genServ: GeneralService,
               private dataService: DataService,
               private loginService: LoginService) {
    this.formData = this.formBuilder.group({
      nombre: '',
      semestre: '',
      año: '',
      fechaInicio: '',
      fechaFin: ''
    });

    this.formConfiguracion = this.formBuilder.group({
      dineroInicial: '',
      cantCompras: '',
      maxCamion: '',
      maxBodega: '',
      precioBloqueEx: '',
      diasBloqueEx: '',
      fechaCobroBloqueEx: '',
      valorImp: '',
      frecCobroImp: '',
      fechaProxCobroImp: '',
      frecRotaLideres: '',
      fechaProxRotaLideres: '',
    });
   }

  async ngOnInit(){
    this.idJuego = this.actRoute.snapshot.params.idJuego;
    await this.getDataGameById();
    await this.getPlayersByGameId();
  }

  getDataGameById(){
    this.genServ.showSpinner();

    this.dataService.getGameById(this.idJuego).subscribe(resp => {
      this.datosJuego = resp.data;
      // console.log(this.datosJuego);
      this.formData = this.formBuilder.group({
        nombre: this.datosJuego.nombre,
        semestre: this.datosJuego.semestre,
        año: '',
        fechaInicio: this.datosJuego.fecha_inicio_format,
        fechaFin: this.datosJuego.fecha_fin_format
      });

      this.formConfiguracion = this.formBuilder.group({
        dineroInicial: this.datosJuego.dineroInicial,
        cantCompras: this.datosJuego.vecesCompraCiudadDia,
        maxCamion: this.datosJuego.maxBloquesCamion,
        maxBodega: this.datosJuego.maxBloquesBodega,
        precioBloqueEx: this.datosJuego.precioBloqueExtra,
        diasBloqueEx: this.datosJuego.freqCobroBloqueExtraDias,
        fechaCobroBloqueEx: this.datosJuego.proxCobroBloqueExtraFormat,
        valorImp: this.datosJuego.valorImpuesto,
        frecCobroImp: this.datosJuego.freqCobroImpuestoDias,
        fechaProxCobroImp: this.datosJuego.proxCobroImpuestoFormat,
        frecRotaLideres: this.datosJuego.freqRotacionLideresDias,
        fechaProxRotaLideres: this.datosJuego.proxRotacionLideresFormat,
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

  getPlayersByGameId(){
    this.genServ.showSpinner();

    this.dataService.getPlayersGameById(this.idJuego).subscribe(resp => {
      // console.log('jugadores', resp.data);
      this.listaJugadores = resp.data.map(p => {
        return {
          idAlumno: p.idAlumno,
          idGrupo: p.idGrupo,
          idJugador: p.idJugador,
          nombre: p.nombre,
          rut: p.rut,
          nombreGrupo: p.nombreGrupo,
          estado: p.estado,
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

  back(){
    this.router.navigate(['admin/juegos']);
  }

  changeDataGeneral(){

  }

  changeDataConfiguration(){

  }

  poderComprar($event){

  }

  poderComerciar($event){

  }

  rotacion($event){

  }

  addPlayer(){

  }

  changeGroup(){
    console.log('si cambio');
  }

}
