import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { GeneralService } from 'src/app/services/general.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ErrorResponse } from 'src/app/interfaces/response';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  public logged: boolean;
  public nombre: string;

  public playerLoginForm:FormGroup;
  public teacherLoginForm:FormGroup;


  constructor( 
    private genServ: GeneralService,
    private userService: UserService,
    private formBuilder: FormBuilder
  ) { 
    this.userService.sessionStatus.subscribe(v => this.logged = v);
    this.playerLoginForm = this.formBuilder.group({ rut: '', password: '', isTeacher: false, teamname: '' });
    this.teacherLoginForm = this.formBuilder.group({ rut: '', password: '', isTeacher: true  });
  }

  ngOnInit(): void { }

  onSubmit (loginData) {
    localStorage.clear();

    this.genServ.showSpinner();
    this.userService.login( loginData ).subscribe( resp => {
      let x = resp.data;
      this.userService.setUserData(x.token, x.rol, x.gameId, x.teamId, loginData.teamname);
      this.userService.setLogin(true); 

      this.playerLoginForm.reset();
      this.teacherLoginForm.reset();

      this.genServ.showToast("ACCESO CORRECTO",`Bienvenido a "<i>Vendedor Viajero</i>"`,"success");
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
    }, () => {
      this.genServ.hideSpinner();
    });
  }

}
