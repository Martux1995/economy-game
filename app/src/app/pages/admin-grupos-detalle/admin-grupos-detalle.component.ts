import { Component, OnInit } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-admin-grupos-detalle',
  templateUrl: './admin-grupos-detalle.component.html',
  styleUrls: ['./admin-grupos-detalle.component.scss']
})
export class AdminGruposDetalleComponent implements OnInit {

  public showModalDelete = false;
  public showModalLider = false;
  public esLider = false;

  public formData: FormGroup;
  public formCamion: FormGroup;
  public formBodega: FormGroup;

  constructor( private router: Router,
               private formBuilder: FormBuilder
  ) {
      this.formData = this.formBuilder.group({
        nombre: '',
        dineroActual: '',
        bloquesExContratados: '',
        estadoPrestamos: '',
        deudaTotal: '',
        utilidades: ''});

      this.formCamion = this.formBuilder.group({
        bloquesUso: '',
        bloquesRestantes: ''});

      this.formBodega = this.formBuilder.group({
        bloquesUso: '',
        bloquesRestantes: ''});
    }


  ngOnInit(): void {
    // Cargar el formulario con los datos de la consulta
  }

  back(){
    this.router.navigate(['admin/grupos']);
  }

  changeDataGeneral(){
    const data = {
      nombre: this.formData.value.nombre,
      dineroActual: this.formData.value.dineroActual
    };
    console.log('enviar valores');
  }

  showTicket(){ }

  // Eliminar a un alumno del grupo
  deleteStudent($event){
    this.showModalDelete = false;
  }

  // Cambia el liderazgo del grupo
  lider($event){
    this.showModalLider = false;
  }
}
