import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-admin-juegos-detalle',
  templateUrl: './admin-juegos-detalle.component.html',
  styleUrls: ['./admin-juegos-detalle.component.scss']
})
export class AdminJuegosDetalleComponent implements OnInit {

  public formData: FormGroup;

  public vigente = false;

  constructor( private router: Router,
               private formBuilder: FormBuilder) {
    this.formData = this.formBuilder.group({
      nombre: '',
      semestre: '',
      año: '',
      fechaInicio: '',
      fechaFin: ''});
   }

  ngOnInit(): void {
  }

  back(){
    this.router.navigate(['admin/juegos']);
  }

  changeDataGeneral(){

  }

  poderComprar($event){

  }

  poderComerciar($event){

  }

  addPlayer(){

  }

}
