import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { DateTime } from 'luxon';

import { WebSocketService } from 'src/app/services/ws.service';
import { GeneralService } from 'src/app/services/general.service';
import { IntercambioProducto } from 'src/app/interfaces/juego';

@Component({
  selector: 'app-juego-comercio',
  templateUrl: './juego-comercio.component.html',
  styleUrls: ['./juego-comercio.component.scss']
})
export class JuegoComercioComponent implements OnInit {

  public cityEnter:FormGroup;
  public attended:boolean;

  public leaveTime:DateTime;
  public productos:any = [];

  constructor(
    private genServ: GeneralService,
    private wsService: WebSocketService,
    private formBuilder: FormBuilder
  ) { }

  // Aqui queremos escuchar un evento
  ngOnInit(): void {
    this.cityEnter = this.formBuilder.group({id: 0});
    this.attended = false;
  
    this.wsService.listen('in-queue').subscribe(d => {
      this.genServ.showToast('EN COLA',`Estas en cola para entrar a la ciudad. Tiempo aproximado: ${d.time} segundos.`,'info');
    });

    this.wsService.listen('attended').subscribe((data) => {
      this.leaveTime = DateTime.fromISO(data.time);

      for (const p of data.products) {
        this.productos.push({
          idProducto: p.idProducto,
          nombre: p.nombre,
          stock: p.stock,
          bloques: p.bloques,
          precioCompra: p.precioCompra,
          precioVenta: p.precioVenta,
          cantidad: new FormControl(0),
          esCompra: true
        });
      }

      this.attended = true;
      this.genServ.showToast('BIENVENIDO',`Bienvenido a la ciudad. Tienes hasta las ${this.leaveTime.toFormat('HH:mm:ss')} para comprar.`,'info');
    });

    this.wsService.listen('city-time-exceded').subscribe(d => {
      this.productos = [];
      this.attended = false;
      this.genServ.showToast('ERROR','Tu tiempo en la ciudad ha finalizado. Gracias por venir.','info');
    });

    this.wsService.listen('not-in-city').subscribe(d => {
      this.genServ.showToast('ERROR','No estás en una ciudad. ¡No te pases de listo!','danger');
    });


    this.wsService.listen('in-other-queue').subscribe(d => {
      this.genServ.showToast('EN COLA',`Ya estas en cola para otra ciudad.`,'info');
    });

    this.wsService.listen('successfull-trade').subscribe(d => {
      this.attended = false;
      this.productos = [];

      this.genServ.showToast('CORRECTO',`Haz realizado la compra.`,'success');
    });

    this.wsService.listen('exit-city').subscribe(d => {
      this.attended = false;
      this.productos = [];
      this.genServ.showToast('CORRECTO',`Haz salido de la ciudad o de la cola.`,'success');
    })
  }

  queueCity(data) {
    this.wsService.emit('city-queue',{cityId: Number(data.id)});
  }

  exit () {
    this.wsService.emit('exit-city',{});
  }

  tradeItems () {
    const cambios:IntercambioProducto[] = [];
    for (const p of this.productos) {
      if (p.cantidad.value > 0) {
        cambios.push({
          idProducto: p.idProducto,
          esCompra: p.esCompra,
          cantidad: p.cantidad.value
        });
      }
    }
    this.wsService.emit('city-trade',cambios);
  }

  ventaOCompra ( valor: boolean, idProducto:number) {
    this.productos.find( p => p.idProducto == idProducto).esCompra = valor;
  }

  back() {
    //this.router.navigate(['/juego/ciudades']);
  }

}
