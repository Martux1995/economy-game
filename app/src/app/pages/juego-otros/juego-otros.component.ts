import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { GroupService } from 'src/app/services/group.service';
import { GeneralService } from 'src/app/services/general.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-juego-otros',
  templateUrl: './juego-otros.component.html',
  styleUrls: ['./juego-otros.component.scss']
})
export class JuegoOtrosComponent implements OnInit {

  public rentBlocksForm:FormGroup;

  public requestedError:string;

  public isRental:boolean = true;

  public nextDate:DateTime;
  public unitCost:number;

  constructor(
    private genServ:GeneralService,
    private groupService:GroupService,
    private formBuilder: FormBuilder
  ) { 

  }

  ngOnInit(): void {
    this.requestedError = '';
    this.rentBlocksForm = this.formBuilder.group({
      rented: 0,
      actualCost: 0,
      requested: 0,
      newCost: 0,
      charge: 0
    });
    this.loadData();
  }

  loadData() {
    this.genServ.showSpinner();
    this.groupService.getRentedBlocks().subscribe(resp => {
      this.unitCost = resp.data.precioBloqueExtra;
      this.nextDate = DateTime.fromISO(resp.data.fechaCobro);
      this.rentBlocksForm.patchValue({
        rented: resp.data.bloquesExtra,
        actualCost: resp.data.precioBloqueExtra * resp.data.bloquesExtra
      })
      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
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

  onRentSubmit (data) {
    this.requestedError = '';
    this.genServ.showSpinner();

    let service = this.isRental ? this.groupService.rentNewBlocks(data.requested) : this.groupService.subletBlocks(data.requested);
    service.subscribe(resp => {
      this.rentBlocksForm.reset();
      this.genServ.hideSpinner();
      this.loadData();
      this.genServ.showToast("CORRECTO",`Bloques extra ${this.isRental ? 'alquilados' : 'desalquilados'}`,"success");
    }, (err:ErrorResponse<{cant:string}>) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
            this.requestedError = err.error.err.cant;
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

  changeValue(data) {
    let valor;
    if (this.rentBlocksForm.value.requested < 0) {
      this.requestedError = 'El valor no puede ser menor o igual a 0.';
      valor = 0;
    } else if (Number(this.rentBlocksForm.value.requested) === 0) {
      this.requestedError = 'El valor es inválido.';
      valor = 0;
    } else {
      this.requestedError = '';
      valor = this.rentBlocksForm.value.requested;
    }
    this.rentBlocksForm.patchValue({
      newCost: valor * this.unitCost * (this.isRental ? 1 : -1) + this.rentBlocksForm.value.actualCost,
      charge: this.isRental ? valor * this.unitCost : 0
    });
  }

  changeRentalState() {
    this.isRental = !this.isRental;
    let valor = this.rentBlocksForm.value.requested;
    this.rentBlocksForm.patchValue({
      newCost: valor * this.unitCost * (this.isRental ? 1 : -1) + this.rentBlocksForm.value.actualCost,
      charge: this.isRental ? valor * this.unitCost : 0
    });
  }

}
