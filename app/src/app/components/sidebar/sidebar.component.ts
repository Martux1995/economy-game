import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { playerMenuRoutes, teacherMenuRoutes, adminMenuRoutes, MenuItem } from '../../app.routes';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input() openSideBar:boolean;
  @Input() userData:{nombre:string, nombreEquipo?:string, rol:string};
  @Output() closeBar = new EventEmitter();
  @Output() logoutAction = new EventEmitter();

  public rol:string;
  public menuItems:MenuItem[];

  constructor() { }

  ngOnInit() {
    this.rol = this.userData.rol;
    if (this.rol === 'ADMINISTRADOR') this.menuItems = adminMenuRoutes;
    else if (this.rol === 'PROFESOR') this.menuItems = teacherMenuRoutes;
    else if (this.rol === 'JUGADOR')  this.menuItems = playerMenuRoutes;
    else                              this.menuItems = [];
  }

  closeSideBar() {
    this.closeBar.emit('');
  }

  logout() {
    this.logoutAction.emit();
  }

}
