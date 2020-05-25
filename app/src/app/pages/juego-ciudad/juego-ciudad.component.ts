import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateTime } from 'luxon';

import { CiudadService } from 'src/app/services/ciudad.service';
import { GeneralService } from 'src/app/services/general.service';
import { LoginService } from 'src/app/services/login.service';
import { WebSocketService } from 'src/app/services/ws.service';

import { ErrorResponse } from 'src/app/interfaces/response';
import { IntercambioProducto } from 'src/app/interfaces/juego';

import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

const URL = environment.urlApi;

@Component({
  selector: 'app-ciudad',
  templateUrl: './juego-ciudad.component.html',
  styleUrls: ['./juego-ciudad.component.scss']
})
export class JuegoCiudadComponent implements OnInit {

  actualTime:DateTime;

  listaCiudades: any[] = [];

  //attended:boolean;
  //leaveTime:DateTime;
  //ciudadData:any;
  //listaProductos: any[] = [];
  
  //eventos:Subscription[] = [];

  constructor( 
    private router:Router,
    private genServ: GeneralService,
    private loginService: LoginService,
    //private wsService: WebSocketService,
    private ciudadService: CiudadService
  ) { }

  ngOnInit() {
    this.getCiudades();
    //this.eventos = this.listenEvents();
    this.genServ.getClock().subscribe(t => {
      this.actualTime = t;
      for (const c of this.listaCiudades) {
        let horaAbre:DateTime = DateTime.fromFormat(c.horaAbre,'HH:mm');
        let horaCierre:DateTime = DateTime.fromFormat(c.horaCierre,'HH:mm');
        c.abierto = horaAbre <= t && t <= horaCierre
      }
    });
  }

  // ngOnDestroy() {
  //   this.wsService.emit('exit-city');
  //   this.eventos.map(d => d.unsubscribe());
  // }

  // timeDiff (closeTime:DateTime) {
  //   const diff = closeTime.diff(this.actualTime);
  //   return diff.toFormat("mm:ss");
  // }

  getCiudades(){
    this.genServ.showSpinner();
    
    this.ciudadService.getCiudades().subscribe(resp => {
      for (const c of resp.data) {
        let horaAbre:DateTime = DateTime.fromFormat(c.horaAbre,'HH:mm:ss');
        let horaCierre:DateTime = DateTime.fromFormat(c.horaCierre,'HH:mm:ss');

        this.listaCiudades.push({
          idCiudad: c.idCiudad,
          nombre: c.nombre,
          descripcion: c.descripcion,
          urlImagen: c.urlImagen ? `${URL}/images/cities/${c.urlImagen}` : null,
          horaAbre: horaAbre.toLocaleString(DateTime.TIME_24_SIMPLE),
          horaCierre: horaCierre.toLocaleString(DateTime.TIME_24_SIMPLE),
          abierto: horaAbre <= this.actualTime && this.actualTime <= horaCierre,
          //esperando: false,
          //error: ''
        });
        
        this.listaCiudades.sort((a,b) => {
          if ( a.nombre < b.nombre )  return -1;
          if ( a.nombre > b.nombre )  return 1;
          return 0;
        });
      }
      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
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

  // listenEvents () {
  //   return [
  //     this.wsService.listen('in-queue').subscribe(d => {
  //       let c = this.listaCiudades.find(c => c.idCiudad == d.cityId);
  //       c.esperando = true;
  //       this.genServ.showToast('EN COLA',`Estas en cola para entrar a ${c.nombre}. Tiempo aproximado: ${d.time} segundos.`,'info');
  //     }),

  //     this.wsService.listen('attended').subscribe((data) => {
  //       this.leaveTime = DateTime.fromISO(data.time);
  //       let c = this.listaCiudades.find(c => c.idCiudad == data.cityId);
  //       this.ciudadData = c;
  //       for (const p of data.products) {
  //         this.listaProductos.push({
  //           idProducto: p.idProducto,
  //           nombre: p.nombre,
  //           stock: p.stock,
  //           bloques: p.bloques,
  //           precioCompra: p.precioCompra,
  //           precioVenta: p.precioVenta,
  //           cantidad: new FormControl(0),
  //           esCompra: true
  //         });
  //       }
        
  //       c.esperando = false;
  //       this.attended = true;
  //       this.genServ.showToast('BIENVENIDO',`Bienvenido a ${c.nombre}. Tienes hasta las <b>${this.leaveTime.toFormat('HH:mm:ss')}</b> para comprar.`,'info');
  //     }),

  //     this.wsService.listen('city-time-exceded').subscribe(d => {
  //       this.listaProductos = [];
  //       this.attended = false;
  //       this.genServ.showToast('ERROR','Tu tiempo en la ciudad ha finalizado. Gracias por venir.','info');
  //     }),

  //     this.wsService.listen('not-in-city').subscribe(d => {
  //       this.genServ.showToast('ERROR','No estás en una ciudad. ¡No te pases de listo!','danger');
  //     }),

  //     this.wsService.listen('in-other-queue').subscribe(d => {
  //       this.genServ.showToast('EN COLA',`Ya estas en cola para otra ciudad.`,'info');
  //     }),

  //     this.wsService.listen('wrong-data').subscribe(err => {
  //       this.genServ.showToast('ERROR',`Hay errores en el formulario. Corríjalos.`,'warning');
  //     }),

  //     this.wsService.listen('no-trade-products').subscribe(d => {
  //       this.genServ.showToast('ERROR',`No hay productos para intercambiar.`,'warning');
  //     }),

  //     this.wsService.listen('no-trade-products').subscribe(d => {
  //       this.genServ.showToast('ERROR',`No hay productos para intercambiar.`,'warning');
  //     }),

  //     this.wsService.listen('not-yet').subscribe(err => {
  //       this.genServ.showToast('ERROR',`Aun no es tu tiempo para entrar a la ciudad. ¡Ponte a la cola!.`,'danger');
  //     }),
      
  //     this.wsService.listen('max-trade-city-reached').subscribe(err => {
  //       this.genServ.showToast('ERROR',`Se ha alcanzado la máxima cantidad de veces de compra en esta ciudad.`,'danger');
  //     }),

  //     this.wsService.listen('no-enough-city-stock').subscribe(err => {
  //       this.genServ.showToast('ERROR',`La ciudad no tiene stock suficiente de un producto para realizar el cambio.`,'danger');
  //     }),

  //     this.wsService.listen('no-enough-group-stock').subscribe(err => {
  //       this.genServ.showToast('ERROR',`El grupo no tiene stock suficiente de un producto para realizar el cambio.`,'danger');
  //     }),

  //     this.wsService.listen('no-enough-money').subscribe(err => {
  //       this.genServ.showToast('ERROR',`El grupo no tiene suficiente dinero para la transacción.`,'danger');
  //     }),

  //     this.wsService.listen('no-truck_available-blocks').subscribe(err => {
  //       this.genServ.showToast('ERROR',`El camión no tiene los bloques suficientes para cargar los productos.`,'danger');
  //     }),

  //     this.wsService.listen('server-error').subscribe(err => {
  //       this.genServ.showToast('ERROR',`Error interno del servidor.`,'danger');
  //     }),

  //     this.wsService.listen('city-closed').subscribe(err => {
  //       this.genServ.showToast("CIUDAD CERRADA",`La ciudad se encuentra cerrada en estos momentos. Regresa mañana.`,"danger");
  //     }),

  //     this.wsService.listen('successfull-trade').subscribe(d => {
  //       this.attended = false;
  //       this.listaProductos = [];
  //       this.genServ.showToast('TRANSACCIÓN REALIZADA',`Muchas gracias por venir.`,'success');
  //     }),

  //     this.wsService.listen('exit-city').subscribe(d => {
  //       this.listaCiudades.map(c => {
  //         c.esperando = false;
  //       })

  //       this.attended = false;
  //       this.listaProductos = [];
  //     })
  //   ]
  // }

  toCity (cityId:number) {
    this.router.navigate(['/juego/ciudades',cityId]);
  }

  closedCityClick () {
    this.genServ.showToast("CIUDAD CERRADA",`La ciudad se encuentra cerrada en estos momentos. Regresa mañana.`,"danger");
  }

  // queue ( cityId: number ) {
  //   this.wsService.emit('city-queue',{cityId: cityId});
  // }

  // exit ( cityId: number ) {
  //   this.wsService.emit('exit-city',{cityId: cityId});
  // }

  // tradeItems () {
  //   const cambios:IntercambioProducto[] = [];
  //   for (const p of this.listaProductos) {
  //     if (p.cantidad.value > 0) {
  //       cambios.push({
  //         idProducto: p.idProducto,
  //         esCompra: p.esCompra,
  //         cantidad: p.cantidad.value
  //       });
  //     }
  //   }
  //   this.wsService.emit('city-trade',cambios);
  // }

}
