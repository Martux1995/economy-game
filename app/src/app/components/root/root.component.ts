import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Grupo } from 'src/app/interfaces/grupo';
import { DataService } from 'src/app/services/data.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent {

  public isMenuOpen:boolean = false;

  public showModal:boolean = false;

  public menuTitle:string = 'Juego de Comercio';

  public rol;

  public groupInfo: Grupo;

  logueado: boolean;
  formulario = {};

  idTeam = new FormControl('');
  rut = new FormControl('');
  pass = new FormControl('');

  rutProfesor = new FormControl('');
  passProfesor = new FormControl('');

  constructor(private http: DataService,
              private userService: UserService,
              private router: Router) { }

  ngOnInit() {
    this.validar();
  }

  async validar(){
    const token = await this.userService.getToken();
    if (token){
      const valido = await this.userService.validateToken(token);
      if ( valido ){
        this.router.navigate(['index']);
        this.rol = localStorage.getItem('rol');
        console.log('ROL', this.rol);
        this.logueado = true;
      }else{
        this.router.navigate(['index']);
        this.logueado = false;
      }
    }
  }

  async print( ok:boolean ) {
    localStorage.removeItem('token');
    if (this.rutProfesor.value && this.passProfesor.value){
      this.formulario = {
        rut: this.rutProfesor.value,
        password: this.passProfesor.value,
        isTeacher: true,
        teamname: '',
      };
    }
    else if (this.idTeam.value && this.rut.value && this.pass.value){
      this.formulario = {
        rut: this.rut.value,
        password: this.pass.value,
        isTeacher: false,
        teamname: this.idTeam.value,
      };
    }
    else {
      alert('Ingrese las credenciales correctas en uno de los dos formularios');
    }

    if (ok) {
      console.log('esto envio del form', this.formulario);
      const valido = await this.userService.login( this.formulario);
      if (valido){
        this.rol = await this.userService.getRol();
        if (this.rol === 'JUGADOR'){
          await localStorage.setItem('rut', this.rut.value);
          await localStorage.setItem('password', this.pass.value);
          await localStorage.setItem('team', this.idTeam.value);
        }
        if (this.rol === 'PROFESOR'){
          await localStorage.setItem('rut', this.rutProfesor.value);
          await localStorage.setItem('password', this.passProfesor.value);
        }
        this.logueado = true;
        this.showModal = false;
        this.rut.reset();
        this.pass.reset();
        this.idTeam.reset();
        this.rutProfesor.reset();
        this.passProfesor.reset();

        // this.http.getGroupData(1).subscribe(d => {
        //   this.groupInfo = d.data;
        // });
      } else {
        alert('datos no validos');
      }
    } else {
      this.showModal = false;
    }

  }

  async logOut() {
    const token = await this.userService.getToken();
    const valido = await this.userService.logout(token);
    if( valido) {
      this.logueado = false;
      this.rol = '';
      this.router.navigate(['/index']);
    }
  }

}
