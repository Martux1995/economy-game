import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Grupo } from 'src/app/interfaces/grupo';
import { DataService } from 'src/app/services/data.service';
import { UserService } from '../../services/user.service';
import { StorageService } from '../../services/storage.service';
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

  logueado = false;
  formulario = {};

  idTeam = new FormControl('');
  rut = new FormControl('');
  pass = new FormControl('');

  rutProfesor = new FormControl('');
  passProfesor = new FormControl('');

  constructor(private http: DataService,
              private userService: UserService,
              private storageService: StorageService,
              private router: Router) { }

  ngOnInit() {

  }

  async print( ok:boolean ) {

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
        console.log(this.rol);
        this.logueado = true;
        this.showModal = false;
        this.rut.reset();
        this.pass.reset();
        this.idTeam.reset();
        this.rutProfesor.reset();
        this.passProfesor.reset();
      } else {
        alert('datos no validos');
      }
    } else {
      this.showModal = false;
    }

  }

  logOut() {
    this.logueado = false;
    this.storageService.clearStorage();
    this.router.navigate(['']);
  }

}
