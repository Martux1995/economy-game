import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
<<<<<<< HEAD
=======
import { LoginService } from 'src/app/services/login.service';
>>>>>>> 37a9b4de0a360e5204824bd6db96e554e742f3de
import { DataService } from 'src/app/services/data.service';
import { ErrorResponse } from '../../interfaces/response';

@Component({
  selector: 'app-admin-alumnos',
  templateUrl: './admin-alumnos.component.html',
  styleUrls: ['./admin-alumnos.component.scss']
})
export class AdminAlumnosComponent implements OnInit {

  public showModal = false;
  public showModalEdit = false;
  public showModalDelete = false;

  public studentForm: FormGroup;

  constructor(private router: Router,
              private genServ: GeneralService,
<<<<<<< HEAD
=======
              private loginService: LoginService,
>>>>>>> 37a9b4de0a360e5204824bd6db96e554e742f3de
              private formBuilder: FormBuilder,
              private dataService: DataService,
  ) {
    this.studentForm = this.formBuilder.group({ nombre: '', apellido: '', rut: ''});
   }

  ngOnInit(): void {
  }

  addStudent( ok:boolean ) {
    console.log(this.studentForm.value);
    // this.genServ.showSpinner();
    // this.dataService.addStudent(this.studentForm.value ).subscribe( resp => {
    //   let x = resp.data;
    //   this.studentForm.reset();
//
    //   this.genServ.showToast("ACCESO CORRECTO",`Bienvenido a "<i>Vendedor Viajero</i>"`,"success");
    // }, (err: ErrorResponse) => {
    //   if (err.status === 400) {
    //     switch (err.error.code) {
    //       case 2501: {
    //         this.genServ.showToast("DATOS INCORRECTOS", `Corrija los errores indicados en el formulario.`, "warning");
    //         break;
    //       }
    //       default: {
    //         this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
    //       }
    //     }
    //   } else {
    //     this.genServ.showToast("ERROR DESCONOCIDO",`Error interno del servidor.`,"danger");
    //     console.log(err);
    //   }
    //   this.genServ.hideSpinner();
    // }, () => {
    //   this.genServ.hideSpinner();
    // });
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
