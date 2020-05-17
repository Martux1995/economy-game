import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { GeneralService } from 'src/app/services/general.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ErrorResponse } from 'src/app/interfaces/response';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  public logged: boolean = false;
  public nombre: string;
  public rol: string;

  public loginForm:FormGroup;

  constructor( 
    private genServ: GeneralService,
    private loginService: LoginService,
    private formBuilder: FormBuilder
  ) {
    this.genServ.showSpinner()
    this.loginService.sessionStatus.subscribe(v => { 
      this.logged = v; 
      this.rol = this.loginService.getRol();
    });
    this.loginForm = this.formBuilder.group({ rut: '', password: '', teamname: null });
    this.checkLogin();
  }
  
  ngOnInit(): void {  }

  checkLogin() {
    this.logged = this.loginService.isAuthenticated();
    if (!this.logged && this.loginService.getToken() != '') {
      this.loginService.renewToken().subscribe( resp => {
          this.loginService.setUserData(resp.data);
          this.genServ.hideSpinner();
        }, (err: ErrorResponse) => {
          if (err.status == 400) {
            switch (err.error.code) {
              case 2701: case 2803: case 2901: case 2902: case 2903: {
                this.loginService.setLogout();
                this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
                break;
              }
              default: {
                this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
              }
            }
          } else {
            this.genServ.showToast("ERROR DESCONOCIDO",`Error interno del servidor.`,"danger");
            this.loginService.setLogout();
            console.log(err);
          }
          this.genServ.hideSpinner();
        }
      );
    } else if (!this.logged) {
      this.loginService.setLogout();
      this.genServ.hideSpinner();
    } else {
      this.genServ.hideSpinner();
    }
  }

  onSubmit (teacher:boolean, loginData) {
    this.loginService.clearData();

    loginData.isTeacher = teacher;

    this.genServ.showSpinner();
    this.loginService.login( loginData ).subscribe( resp => {
      let x = resp.data;
      this.loginService.setUserData(x);

      this.loginForm.reset();

      this.genServ.hideSpinner();
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
    });
  }

}
