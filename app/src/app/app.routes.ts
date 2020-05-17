import { Route } from '@angular/router';

import { IndexComponent } from './pages/index/index.component';

import { JuegoCiudadComponent } from './pages/juego-ciudad/juego-ciudad.component';
//import { JuegoComercioComponent } from './pages/juego-comercio/juego-comercio.component';
import { JuegoBodegaComponent } from './pages/juego-bodega/juego-bodega.component';
import { JuegoOtrosComponent } from './pages/juego-otros/juego-otros.component';

import { AdminAlumnosComponent } from './pages/admin-alumnos/admin-alumnos.component';
import { AdminProfesoresComponent } from './pages/admin-profesores/admin-profesores.component';
import { AdminCarrerasComponent } from './pages/admin-carreras/admin-carreras.component';
import { AdminGruposComponent } from './pages/admin-grupos/admin-grupos.component';
import { AdminGruposDetalleComponent } from './pages/admin-grupos-detalle/admin-grupos-detalle.component';

import { ProfesorCiudadComponent } from './pages/profesor-ciudad/profesor-ciudad.component';

import { AuthGuard } from './guards/auth.guard';
import { UsuarioGuard } from './guards/usuario.guard';

export interface MenuItem {
    icon: string;
    itemName: string;
    itemRoute: string[];
    isOpen?: boolean;
    subMenuId?: string;
    subMenu?: SubMenuItem[];
}

export interface SubMenuItem {
    itemName:string;
    itemRoute: string[];
}

/** Rutas que el jugador verá al momento de iniciar sesión */
export const playerMenuRoutes:MenuItem[] = [
    { 
        icon: 'fa-chess-king', itemName: 'Juego', itemRoute: [], isOpen: false, subMenuId: 'gameMenu', 
        subMenu : [
            { itemName: 'Ciudades',         itemRoute: ['/juego/ciudades'] },
            //{ itemName: 'Comercio',         itemRoute: ['/juego/comercio'] },
            { itemName: 'Bodega',           itemRoute: ['/juego/bodega'] },
            //{ itemName: 'Crear Productos',  itemRoute: ['/juego/crear']},
            { itemName: 'Otros',            itemRoute: ['/juego/otros']}
        ]
    }
];

/** Rutas que el profesor verá al momento de iniciar sesión */
export const teacherMenuRoutes:MenuItem[] = [
    { 
        icon: 'fa-chess-king', itemName: 'Ciudades', itemRoute: ['/ciudades'] 
    },{
        icon: 'fa-users-cog', itemName: 'Administración', itemRoute: [], isOpen: false, subMenuId: 'menu2', 
        subMenu : [
            { itemName: 'Alumnos', itemRoute: ['/admin/alumnos'] },
            { itemName: 'Grupos', itemRoute: ['/admin/grupos'] },
        ]
    }
];

/** Rutas que el administrador verá al momento de iniciar sesión */
export const adminMenuRoutes:MenuItem[] = [
    { 
        icon: 'fa-chess-king', itemName: 'Ciudades', itemRoute: ['/ciudades'] 
    },/*{ 
        icon: "fa-chess-king", itemName: 'Jugar', itemRoute: [], isOpen: false, subMenuId: 'menu1',
        subMenu : [
            { itemName: 'Seleccionar Juego', itemRoute: ['/juegos/lista'] },
            { itemName: 'Ver estadísticas', itemRoute: ['/juegos/detalle'] }
        ]
    },*/{ 
        icon: 'fa-users-cog', itemName: 'Administración', itemRoute: [], isOpen: false, subMenuId: 'menu2',
        subMenu : [
            { itemName: 'Alumnos',      itemRoute: ['/admin/alumnos'] },
            { itemName: 'Profesores',   itemRoute: ['/admin/profesores'] },
            { itemName: 'Carreras',     itemRoute: ['/admin/carreras'] },
            { itemName: 'Grupos',       itemRoute: ['/admin/grupos'] },
        ]
    }
];

/** Rutas que son utilizadas por el app.module.ts */
export const routes:Route[] = [
    {path: 'index', component: IndexComponent},
    {path: 'login', redirectTo: '/index'},
    // RUTAS PARA LOS JUGADORES
    {path: 'juego/ciudades',                      component: JuegoCiudadComponent,            canActivate: [AuthGuard]},
    //{path: 'juego/comercio',                      component: JuegoComercioComponent,          canActivate: [AuthGuard]},
    //{path: 'juego/ciudades/:cityId/intercambio',  component: JuegoCiudadTransaccionComponent, canActivate: [AuthGuard]},
    {path: 'juego/bodega',                        component: JuegoBodegaComponent,            canActivate: [AuthGuard]},
    {path: 'juego/otros',                         component: JuegoOtrosComponent,             canActivate: [AuthGuard]},
    // RUTAS PARA LOS PROFESORES
    {path: 'juegos/',                   redirectTo: '/index'},
    {path: 'juegos/:gameId',            redirectTo: '/index'},
    {path: 'admin/alumnos',             component: AdminAlumnosComponent,       canActivate: [UsuarioGuard]},
    {path: 'admin/profesores',          component: AdminProfesoresComponent,    canActivate: [UsuarioGuard]},
    {path: 'admin/carreras',            component: AdminCarrerasComponent,      canActivate: [UsuarioGuard]},
    {path: 'admin/grupos',              component: AdminGruposComponent,        canActivate: [UsuarioGuard]},
    {path: 'admin/grupos/:teamId',      component: AdminGruposDetalleComponent, canActivate: [UsuarioGuard]},
    {path: 'profesor/:cityId/ciudad',   component: ProfesorCiudadComponent},
    // RUTA PARA LOS ADMINISTRADORES
    {path: 'admin/carreras',        redirectTo: '/index'},
    {path: 'admin/carreras/:id',    redirectTo: '/index'},
    // RUTA COMODIN GENERAL
    {path: '**', redirectTo: '/index', pathMatch: 'full'},
];

export default routes;