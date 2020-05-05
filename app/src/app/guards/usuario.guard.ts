import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioGuard {

  constructor( private userService: UserService ,
               private router: Router) {}

  canActivate(): boolean {
    const value = this.userService.isAuthenticated();
    if (!value) {
      this.router.navigateByUrl('/index');
    }
    return value;
  }

}
