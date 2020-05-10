import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { UserService } from '../services/user.service';
import { GeneralService } from '../services/general.service';

import { ErrorResponse } from '../interfaces/response';

@Injectable({
    providedIn: 'root'
  })
export class AuthGuard implements CanActivate {

    constructor( 
        private genServ: GeneralService,
        private userService: UserService,
        private router: Router
    ) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean> | Promise<boolean> | boolean {
        
        if (this.userService.isAuthenticated()) {
            return true;
        }
        this.genServ.showSpinner();
        return this.userService.renewToken().pipe(
            map(r => {
                //this.rol = this.userService.getRol();
                this.userService.setUserData(r.data.token);
                this.genServ.hideSpinner();
                return true;
            }), catchError((err: ErrorResponse) => {
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
                throw new Error('');
            }));
    }


}
