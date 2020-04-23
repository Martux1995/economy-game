import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input() openSideBar;
  @Output() closeBar = new EventEmitter();

  public menuItems = [
    { icon: "fa-home", itemName: 'Inicio',   itemRoute: ['/index'] },
    { icon: "fa-chess-king", itemName: 'Ciudades', itemRoute: ['/ciudades'] },
    /*{ icon: "fa-chess-king", itemName: 'Jugar',    itemRoute: [], isOpen: false, 
      subMenuName: 'menu1',
      subMenu : [
        { itemName: 'Seleccionar Juego', itemRoute: ['/juegos/lista'] },
        { itemName: 'Ver estadísticas', itemRoute: ['/juegos/detalle'] }
      ]
    },*/
    { icon: "fa-users-cog", itemName: 'Administración', itemRoute: [], isOpen: false, 
      subMenuName: 'menu2',
      subMenu : [
        { itemName: 'Alumnos', itemRoute: ['/admin/alumnos'] },
        { itemName: 'Profesores', itemRoute: ['/admin/profesores'] },
        { itemName: 'Carreras', itemRoute: ['/admin/carreras'] },
        { itemName: 'Grupos', itemRoute: ['/admin/grupos'] },
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  closeSideBar() {
    this.closeBar.emit( '' );
  }

}
