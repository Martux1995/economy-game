import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioGuard {

  constructor( private loginService: LoginService ,
               private router: Router) {}

  canActivate(): boolean {
    if (!this.loginService.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return false;
    }
    return true;
  }

}
