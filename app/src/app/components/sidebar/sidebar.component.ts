import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input() openSideBar;
  @Input() rolUser;
  @Output() closeBar = new EventEmitter();
  @Output() logoutAction = new EventEmitter();

  rol = localStorage.getItem('rol');
  public menuItems;

  constructor() {

    console.log(this.rol);
    if (this.rol === 'ADMINISTRADOR'){
      this.menuItems = [
        { icon: 'fa-home', itemName: 'Inicio',   itemRoute: ['/index'] },
        { icon: 'fa-chess-king', itemName: 'Ciudades', itemRoute: ['/ciudades'] },
        /*{ icon: "fa-chess-king", itemName: 'Jugar',    itemRoute: [], isOpen: false,
          subMenuName: 'menu1',
          subMenu : [
            { itemName: 'Seleccionar Juego', itemRoute: ['/juegos/lista'] },
            { itemName: 'Ver estadísticas', itemRoute: ['/juegos/detalle'] }
          ]
        },*/
        { icon: 'fa-users-cog', itemName: 'Administración', itemRoute: [], isOpen: false,
          subMenuName: 'menu2',
          subMenu : [
            { itemName: 'Alumnos', itemRoute: ['/admin/alumnos'] },
            { itemName: 'Profesores', itemRoute: ['/admin/profesores'] },
            { itemName: 'Carreras', itemRoute: ['/admin/carreras'] },
            { itemName: 'Grupos', itemRoute: ['/admin/grupos'] },
          ]
        }
      ];
    }
    if (this.rol === 'JUGADOR'){
      this.menuItems = [
        { icon: 'fa-home', itemName: 'Inicio',   itemRoute: ['/index'] },
        { icon: 'fa-users-cog', itemName: 'Juego', itemRoute: [], isOpen: false,
          subMenuName: 'menu2',
          subMenu : [
            { itemName: 'Ciudades', itemRoute: ['/ciudades'] },
            { itemName: 'Comercio', itemRoute: ['/comercio'] },
            { itemName: 'Bodega', itemRoute: ['/bodega'] },
          ]
        }
      ];
    }
    if (this.rol === 'PROFESOR'){
      this.menuItems = [
        { icon: 'fa-home', itemName: 'Inicio',   itemRoute: ['/index'] },
        { icon: 'fa-chess-king', itemName: 'Ciudades', itemRoute: ['/ciudades'] },
        { icon: 'fa-users-cog', itemName: 'Administración', itemRoute: [], isOpen: false,
          subMenuName: 'menu2',
          subMenu : [
            { itemName: 'Alumnos', itemRoute: ['/admin/alumnos'] },
            { itemName: 'Grupos', itemRoute: ['/admin/grupos'] },
          ]
        }
      ];
    }
   }

  ngOnInit(): void { }

  closeSideBar() {
    this.closeBar.emit( '' );
  }

  logout() {
    this.logoutAction.emit();
  }

}
