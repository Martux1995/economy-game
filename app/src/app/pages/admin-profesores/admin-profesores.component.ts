import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-profesores',
  templateUrl: './admin-profesores.component.html',
  styleUrls: ['./admin-profesores.component.scss']
})
export class AdminProfesoresComponent implements OnInit {

  public showModalDelete = false;

  constructor() { }

  ngOnInit(): void {
  }

  change($event) {
    this.showModalDelete = false;
    console.log('estado cambiado');
  }

}
