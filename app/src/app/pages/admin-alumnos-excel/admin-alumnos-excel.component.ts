import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { AlumnoData, ExcelCheck, AlumnoExcelData } from 'src/app/interfaces/admin';
import { AdminService } from 'src/app/services/admin.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-admin-alumnos-excel',
  templateUrl: './admin-alumnos-excel.component.html',
  styleUrls: ['./admin-alumnos-excel.component.scss']
})
export class AdminAlumnosExcelComponent implements OnInit {

  public types = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel"
  ]


  public studentExcelFile:File = null;

  public correctRows:number = 0;
  public incorrectRows:number = 0;

  public data:ExcelCheck<AlumnoExcelData> = {
    correct: [],
    errors: []
  };

  public excelHeaders = [
    { prop: '__rowNum__', name: '#'},
    { prop: 'RUT',        name: 'RUT'}, 
    { prop: 'NOMBRES',    name: 'Nombres'}, 
    { prop: 'APELLIDO_P', name: 'Apellido Paterno'}, 
    { prop: 'APELLIDO_M', name: 'Apellido Materno'}, 
    { prop: 'CORREO',     name: 'Correo electrónico'}
  ]

  constructor(
    private genServ:GeneralService,
    private adminService:AdminService,
    private loginService:LoginService
  ) { }

  ngOnInit(): void {
  }

  // -----------------------------------------
  //        ADMIN STUDENT EXCEL FILE
  // -----------------------------------------
  
  async handleFileInput (files:FileList) {
    if (files.length > 1) {
      this.genServ.showToast('ERROR',"Seleccione solo un archivo Excel.",'danger');
      return;
    }

    if (!this.types.find(d => d == files[0].type)){
      this.genServ.showToast('ERROR',"El archivo subido no es válido.",'danger');
      return;
    }

    this.studentExcelFile = files.item(0);

    this.genServ.showSpinner();
    try {
      this.data = await this.genServ.getStudentsFromExcel(this.studentExcelFile);

      this.correctRows = this.data.correct.length;
      this.incorrectRows = this.data.errors.length;

      this.genServ.hideSpinner();
    } catch (err) {
      this.studentExcelFile = null;
      this.genServ.showToast('ERROR',err.message,'danger');
    } finally {
      this.genServ.hideSpinner();
    }
  } 

  submitStudents () {
    this.genServ.showSpinner();
    let data:AlumnoData[] = this.data.correct.map(r => {
      return { nombres: r.NOMBRES, apellidoP: r.APELLIDO_P, apellidoM: r.APELLIDO_M, rut: r.RUT, correo:r.CORREO }
    });

    this.adminService.addStudents(data).subscribe(resp => {
      this.genServ.showToast('CORRECTO','Alumnos ingresados exitosamente.','success');
      this.genServ.hideSpinner();
    }, err => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
            break;
          }
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            this.loginService.setLogout();
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
    })

  }

}
