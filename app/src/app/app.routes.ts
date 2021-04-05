import { Route } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { UsuarioGuard } from './guards/usuario.guard';

import { IndexComponent } from './pages/index/index.component';

import { JuegoCiudadComponent } from './pages/juego-ciudad/juego-ciudad.component';
import { JuegoCiudadTransaccionComponent } from './pages/juego-ciudad-transaccion/juego-ciudad-transaccion.component';
//import { JuegoComercioComponent } from './pages/juego-comercio/juego-comercio.component';
import { JuegoBodegaComponent } from './pages/juego-bodega/juego-bodega.component';
import { JuegoOtrosComponent } from './pages/juego-otros/juego-otros.component';

import { AdminGruposComponent } from './pages/admin-grupos/admin-grupos.component';
import { AdminGruposDetalleComponent } from './pages/admin-grupos-detalle/admin-grupos-detalle.component';

import { ProfesorListaCiudadesComponent } from './pages/profesor-lista-ciudades/profesor-lista-ciudades.component';
import { ProfesorCiudadComponent } from './pages/profesor-ciudad/profesor-ciudad.component';

import { AdminAlumnosExcelComponent } from './pages/admin-alumnos-excel/admin-alumnos-excel.component';
import { AdminGruposExcelComponent } from './pages/admin-grupos-excel/admin-grupos-excel.component';
import { AdminGeneralComponent } from './pages/admin-general/admin-general.component';
import { AdminUsuariosComponent } from './pages/admin-usuarios/admin-usuarios.component';
import { AdminJuegosComponent } from './pages/admin-juegos/admin-juegos.component';
import { AdminJuegosDetalleComponent } from './pages/admin-juegos-detalle/admin-juegos-detalle.component';

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
            { itemName: 'Bodega',           itemRoute: ['/juego/bodega'] },
            //{ itemName: 'Comercio',         itemRoute: ['/juego/comercio'] },
            //{ itemName: 'Crear Productos',  itemRoute: ['/juego/crear']},
            { itemName: 'Otros',            itemRoute: ['/juego/otros']}
        ]
    }
];

/** Rutas que el profesor verá al momento de iniciar sesión */
export const teacherMenuRoutes:MenuItem[] = [
    { 
        icon: 'fa-chess-king', itemName: 'Ciudades', itemRoute: ['/ciudades'] 
    }
    // ,{
    //     icon: 'fa-users-cog', itemName: 'Administración', itemRoute: [], isOpen: false, subMenuId: 'menu2', 
    //     subMenu : [
    //         { itemName: 'Alumnos', itemRoute: ['/admin/alumnos'] },
    //         { itemName: 'Grupos', itemRoute: ['/admin/grupos'] },
    //     ]
    // }
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
            { itemName: 'General',   itemRoute: ['/admin/general'] },
            { itemName: 'Usuarios',   itemRoute: ['/admin/usuarios'] },
            { itemName: 'Grupos',       itemRoute: ['/admin/grupos'] },
            { itemName: 'Juegos',   itemRoute: ['/admin/juegos'] },
        ]
    }
];

/** Rutas que son utilizadas por el app.module.ts */
export const routes:Route[] = [
    {path: 'index',                         component: IndexComponent},
    {path: 'login',                         redirectTo: '/index'},
    // RUTAS PARA LOS JUGADORES
    {path: 'juego/ciudades',                component: JuegoCiudadComponent,            canActivate: [AuthGuard]},
    {path: 'juego/ciudades/:cityId',        component: JuegoCiudadTransaccionComponent, canActivate: [AuthGuard]},
    // {path: 'juego/comercio',              component: JuegoComercioComponent,          canActivate: [AuthGuard]},
    {path: 'juego/bodega',                  component: JuegoBodegaComponent,            canActivate: [AuthGuard]},
    {path: 'juego/otros',                   component: JuegoOtrosComponent,             canActivate: [AuthGuard]},
    // RUTAS PARA LOS PROFESORES
    {path: 'ciudades',                      component: ProfesorListaCiudadesComponent,  canActivate: [AuthGuard]},
    {path: 'ciudades/:cityId',              component: ProfesorCiudadComponent,         canActivate: [AuthGuard]},
    //{path: 'juegos/:gameId',                redirectTo: '/index'},
    {path: 'admin/alumnos/excel',           component: AdminAlumnosExcelComponent,  canActivate: [AuthGuard]},
    {path: 'admin/grupos',                  component: AdminGruposComponent,        canActivate: [UsuarioGuard]},
    {path: 'admin/grupos/excel',            component: AdminGruposExcelComponent,   canActivate: [AuthGuard]},
    {path: 'admin/grupos/:teamId',          component: AdminGruposDetalleComponent, canActivate: [UsuarioGuard]},
    // RUTA PARA LOS ADMINISTRADORES
    {path: 'admin/general',                 component: AdminGeneralComponent, canActivate: [UsuarioGuard]},
    {path: 'admin/usuarios',                component: AdminUsuariosComponent, canActivate: [UsuarioGuard]},
    {path: 'admin/juegos',                  component: AdminJuegosComponent, canActivate: [UsuarioGuard]},
    {path: 'admin/juegos/detalle/:idJuego', component: AdminJuegosDetalleComponent, canActivate: [UsuarioGuard]},
    // RUTA COMODIN GENERAL
    {path: '**', redirectTo: '/index', pathMatch: 'full'},
];