import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { GeneralService } from 'src/app/services/general.service';
import { DateTime } from 'luxon';
import { ErrorResponse } from 'src/app/interfaces/response';


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

	actualTime:DateTime = DateTime.local();

	idTeam = new FormControl('');
	rut = new FormControl('');
	pass = new FormControl('');

	rutProfesor = new FormControl('');
	passProfesor = new FormControl('');

	toastProperties = {};
	toastClasses = '';

	constructor(
		private genServ: GeneralService,
		private userService: UserService,
		private router: Router
	) {
		this.toastProperties = this.genServ.getToastProperties();
		this.getTime();
	}

	ngOnInit() {
		this.genServ.loadingStatus.subscribe(val => this.cargando = val);
		this.userService.sessionStatus.subscribe(val => this.logueado = val);

		if (this.userService.getToken() != null)
			this.validate();
	}

	getTime() {
		this.genServ.showSpinner();
		this.genServ.getServerTime().subscribe( resp => {
			this.genServ.setTime(resp.data.momento);
			this.genServ.getTimeInfo().subscribe( val => { this.actualTime = val; });
		}, (err:ErrorResponse) => {
			console.log(err);
			this.genServ.setTime(DateTime.local().toISO());
			this.genServ.getTimeInfo().subscribe( val => { this.actualTime = val; });
			this.genServ.hideSpinner();
		}, () => {
			this.genServ.hideSpinner();
		})
	}

	// Valida si la sesión sigue siendo válida y renueva el token
	validate() {
		this.genServ.showSpinner();
		this.userService.renewToken().subscribe( resp => {

			this.userService.setUserData(resp.data.token);
			this.userService.setLogin(true);
			this.router.navigate(['/index']);
			this.rol = this.userService.getRol();

		}, (err:ErrorResponse) => {
			if (err.status == 400) {
				switch (err.error.code) {
					case 2701: case 2803: case 2901: case 2902: case 2903: {
						this.userService.setLogin(false);
						this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
						this.router.navigate(['/']);
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

	// Realiza el inicio de sesión
  	login( ok:boolean ) {
		localStorage.clear();
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
				this.genServ.showToast("DATOS INCORRECTOS","Ingrese sus credenciales en la página que corresponda.","warning");
				return;
			}

			this.genServ.showSpinner();
			this.userService.login( this.formulario).subscribe( resp => {
				let x = resp.data;
				this.userService.setUserData(x.token, x.rol, x.gameId, x.teamId, this.idTeam.value);
				this.rol = x.rol;

				this.genServ.showToast("ACCESO CORRECTO",`Bienvenido a "<i>Vendedor Viajero</i>"`,"success");

				this.userService.setLogin(true); 
				this.showModal = false;

				this.rut.reset();
				this.pass.reset();
				this.idTeam.reset();
				this.rutProfesor.reset();
				this.passProfesor.reset();

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
		} else {
			this.showModal = false;
		}

  	}

	// Cierra la sesión
	logOut() {
		if (confirm("¿Está seguro que desea salir?")){
			this.genServ.showSpinner();
			this.userService.logout().subscribe(resp => {
				this.genServ.showToast("SESIÓN CERRADA",`Se ha cerrado la sesión. Gracias por jugar.`,"success");
			}, err => {
				console.log(err);
				this.genServ.showToast("SESIÓN CERRADA",`Se ha cerrado la sesión. Gracias por jugar.`,"success");
				this.genServ.hideSpinner();
			}, () => {
				this.genServ.hideSpinner();
			});
			this.userService.setLogin(false);
			this.rol = '';
			this.router.navigate(['/index']);
		}
	}

}
