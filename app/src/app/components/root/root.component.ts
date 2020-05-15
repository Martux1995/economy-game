import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

import { LoginService } from 'src/app/services/login.service';
import { GeneralService } from 'src/app/services/general.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { startWith, delay, tap } from 'rxjs/operators';
import { WebSocketService } from 'src/app/services/ws.service';


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

	// INDICA SI EL USUARIO SE ENCUENTRA INGRESADO O NO
	public logueado: boolean = false;

	// DATOS DEL USUARIO
	public user = { nombre: '', nombreEquipo: '', rol: '' };

	// INDICA SI EL SPINNER DEBE MOSTRARSE
	public cargando: boolean;

	// RELOJ DEL SISTEMA BASADO EN SERVIDOR
	public actualTime:DateTime = DateTime.local();

	// ELEMENTOS DEL TOAST
	public toastProperties = {};
	public toastClasses = '';

	constructor(
		private genServ: GeneralService,
		private loginService: LoginService,
		private router: Router,
		private wsService: WebSocketService
	) { 
		this.loginService.sessionStatus.subscribe(val => {
			this.logueado = val;
			if (val) {
				this.user = {
					nombre: this.loginService.getName(),
					nombreEquipo: this.loginService.getTeamName(),
					rol: this.loginService.getRol()
				}
			} else {
				this.router.navigateByUrl('/login');
			}
		});
		this.genServ.loadingStatus.pipe(
			startWith(null),	
			delay(0),
			tap(val => this.cargando = val)
		).subscribe();
	}
	
	ngOnInit() { 
		this.logueado = this.loginService.isAuthenticated();
		if (!this.logueado) {
			this.user = { nombre: '', nombreEquipo: '', rol: '' }
		}
		this.toastProperties = this.genServ.getToastProperties();
		this.getTime();
	}

	getTime() {
		this.genServ.showSpinner();
		this.genServ.getServerTime().subscribe( resp => {
			this.genServ.setTime(resp.data.momento);
			this.genServ.getTimeInfo().subscribe( val => { this.actualTime = val; });
			this.genServ.hideSpinner();
		}, (err:ErrorResponse) => {
			console.log(err);
			this.genServ.setTime(DateTime.local().toISO());
			this.genServ.getTimeInfo().subscribe( val => { this.actualTime = val; });
			this.genServ.hideSpinner();
		});
	}

	// Cierra la sesión (hay que cambiar el confirm por el modal)
	logOut() {
		if (confirm("¿Está seguro que desea salir?")){
			this.genServ.showSpinner();
			this.loginService.logout().subscribe(resp => {
				this.genServ.showToast("SESIÓN CERRADA",`Se ha cerrado la sesión. Gracias por jugar.`,"success");
				this.genServ.hideSpinner();
			}, err => {
				console.log(err);
				this.genServ.showToast("SESIÓN CERRADA",`Se ha cerrado la sesión. Gracias por jugar.`,"success");
				this.genServ.hideSpinner();
			});
			this.loginService.setLogout();
			this.router.navigateByUrl('/login');
		}
	}

}
