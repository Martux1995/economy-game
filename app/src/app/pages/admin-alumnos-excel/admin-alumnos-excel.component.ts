import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';

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

  constructor(
    private genServ:GeneralService
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
    let x = await this.genServ.getStudentsFromExcel(this.studentExcelFile);
    this.genServ.hideSpinner();
  } 

}
