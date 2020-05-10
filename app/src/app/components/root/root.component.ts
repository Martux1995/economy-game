import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

import { UserService } from 'src/app/services/user.service';
import { GeneralService } from 'src/app/services/general.service';
import { ErrorResponse } from 'src/app/interfaces/response';


@Component({
	selector: 'app-root',
	templateUrl: './root.component.html',
	styleUrls: ['./root.component.scss']
})
export class RootComponent {

	// NOMBRE DEL SISTEMA
	public menuTitle:string = 'Vendedor Viajero';

	// INDICA SI EL MENÚ SE ENCUENTRA ABIERTO O CERRADO CUANDO LA VENTANA ES CHICA
	public isMenuOpen:boolean = false;

	// INDICA SI EL MODAL DEBE MOSTRARSE O NO (CAMBIAR DESPUES)
	public showModal:boolean = false;
	public rol:any = '';

	// INDICA SI EL USUARIO SE ENCUENTRA INGRESADO O NO
	logueado: boolean = false;

	// INDICA SI EL SPINNER DEBE MOSTRARSE
	cargando: boolean = false;

	// RELOJ DEL SISTEMA BASADO EN SERVIDOR
	actualTime:DateTime = DateTime.local();

	// ELEMENTOS DEL TOAST
	public toastProperties = {};
	public toastClasses = '';

	constructor(
		private genServ: GeneralService,
		private userService: UserService,
		private router: Router
	) {
		this.genServ.loadingStatus.subscribe(val => this.cargando = val);
		this.userService.sessionStatus.subscribe(val => this.logueado = val);
		this.toastProperties = this.genServ.getToastProperties();
		this.getTime();
	}

	ngOnInit() { }

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

	// Cierra la sesión (hay que cambiar el confirm por el modal)
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
