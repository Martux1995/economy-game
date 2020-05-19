import { Component, OnInit } from '@angular/core';
import { ExcelCheck, GrupoExcelData, GrupoData } from 'src/app/interfaces/admin';
import { GeneralService } from 'src/app/services/general.service';
import { AdminService } from 'src/app/services/admin.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-admin-grupos-excel',
  templateUrl: './admin-grupos-excel.component.html',
  styleUrls: ['./admin-grupos-excel.component.scss']
})
export class AdminGruposExcelComponent implements OnInit {


  public types = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel"
  ]


  public groupsExcelFile:File = null;

  public correctRows:number = 0;
  public incorrectRows:number = 0;

  public data:ExcelCheck<GrupoExcelData> = {
    correct: [],
    errors: []
  };

  public excelHeaders = [
    { prop: 'rowNum', name: '#'},
    { prop: 'NOMBRE_GRUPO', name: 'Nombre del grupo'}
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

    this.groupsExcelFile = files.item(0);

    this.genServ.showSpinner();
    try {
      this.data = await this.genServ.getGroupsFromExcel(this.groupsExcelFile);

      let max = 0;
      this.data.correct.forEach(e => {
        let val = Object.keys(e).length;
        max = val > max ? val : max;
      });
      
      max = max - 1;
      
      for (let i = 1; i <= max; i++) {
        this.excelHeaders.push({name: `RUT ${i}`,prop:`RUT_${i}`});
      }
      
      this.correctRows = this.data.correct.length;
      this.incorrectRows = this.data.errors.length;
    } catch (err) {
      this.groupsExcelFile = null;
      this.genServ.showToast('ERROR',err.message,'danger');
    } finally {
      this.genServ.hideSpinner();
    }
  } 

  submitGroups () {
    this.genServ.showSpinner();
    let data:GrupoData[] = this.data.correct.map(r => {
      let ruts = [], i = 1;
      while(true){
        if (!r[`RUT_${i}`]) break;
        else  ruts.push(r[`RUT_${i}`]);
        i++;
      }

      return { nombreGrupo: r.NOMBRE_GRUPO, rut: ruts, id: r.rowNum }
    });

    this.adminService.addGroups(data).subscribe(resp => {
      this.genServ.showToast('CORRECTO','Grupos ingresados exitosamente.','success');
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
