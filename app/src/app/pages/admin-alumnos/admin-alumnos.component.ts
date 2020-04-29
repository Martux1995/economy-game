import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-admin-alumnos',
  templateUrl: './admin-alumnos.component.html',
  styleUrls: ['./admin-alumnos.component.scss']
})
export class AdminAlumnosComponent implements OnInit {

  public showModal:boolean = false;
  public showModalEdit:boolean = false;
  public showModalDelete:boolean = false;

  nombreAlumno = new FormControl('');
  carreraAlumno = new FormControl('');

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  addStudent( ok:boolean ) {
    console.log(ok);
    this.showModal = false;
  }

  editStudent( ) {
    // console.log(ok);
    this.showModalEdit = false;
  }

  deleteStudent( ok:boolean ){
    console.log(ok);
    this.showModalDelete = false;
  }

}
