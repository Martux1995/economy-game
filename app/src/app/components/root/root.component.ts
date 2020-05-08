import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { GeneralService } from 'src/app/services/general.service';


@Component({
	selector: 'app-root',
	templateUrl: './root.component.html',
	styleUrls: ['./root.component.scss']
})
export class RootComponent {

	public isMenuOpen:boolean = false;

	public showModal:boolean = false;

	public menuTitle:string = 'Juego de Comercio';

	public rol:any = '';

	formulario = {};
	logueado: boolean = false;

	cargando: boolean = false;
	loadSubs: Subscription;

	idTeam = new FormControl('');
	rut = new FormControl('');
	pass = new FormControl('');

	rutProfesor = new FormControl('');
	passProfesor = new FormControl('');

	constructor(
		private genServ: GeneralService,
		private userService: UserService,
		private router: Router
	) { }

	ngOnInit() {
		this.loadSubs = this.genServ.loadingStatus.subscribe(val => this.cargando = val);
		this.validate();
	}

	async validate(){
		const x = await this.userService.renewToken();

		if (x) {
			this.rol = this.userService.getRol();
			this.logueado = true;
			//this.router.navigate(['/index']);
		} else {
			this.logueado = false;
		}
	}

  	async login( ok:boolean ) {
		localStorage.removeItem('token');
		if (ok) {
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
				return;
			}

			this.genServ.showSpinner();
			this.userService.login( this.formulario).subscribe( resp => {
				localStorage.setItem('token',	resp.data.token);
				localStorage.setItem('rol',		resp.data.rol);
				localStorage.setItem('gameId', 	String(resp.data.gameId));
				localStorage.setItem('teamId', 	String(resp.data.teamId));
				
				this.userService.isLogged = true;

				if (resp.data.rol == "JUGADOR") {
					localStorage.setItem('team', this.idTeam.value);
				}

				alert(resp.msg);

				this.logueado = true;
				this.showModal = false;

				this.rut.reset();
				this.pass.reset();
				this.idTeam.reset();
				this.rutProfesor.reset();
				this.passProfesor.reset();

			}, err => {
				alert(err.error.msg);
				this.userService.isLogged = false;
				this.genServ.hideSpinner();
			}, () => {
				this.genServ.hideSpinner();
			});
		} else {
			this.showModal = false;
		}

  	}

	async logOut() {
		if (confirm("¿Está seguro que desea salir?")){
			this.userService.logout(localStorage.getItem('token')).subscribe(resp => {
				alert('Se ha cerrado la sesión');
			}, err => {
				console.log(err);
			});
			localStorage.clear();
			this.logueado = false;
			this.rol = '';
			this.router.navigate(['/index']);
		}
	}

}
