import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-general',
  templateUrl: './admin-general.component.html',
  styleUrls: ['./admin-general.component.scss']
})
export class AdminGeneralComponent implements OnInit {

  public activadoCarrera = false;
  public activadoProfesor = false;
  public activadoAlumno = false;

  constructor() { }

  ngOnInit(): void {
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
