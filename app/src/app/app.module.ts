import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { Route, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AlertModule } from 'ngx-bootstrap/alert';
import { NgxBootstrapSwitchModule } from 'ngx-bootstrap-switch';

import { RootComponent } from './components/root/root.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ModalComponent } from './components/modal/modal.component';

import { UsuarioGuard } from './guards/usuario.guard';

import { GeneralService } from './services/general.service';
import { DataService } from './services/data.service';
import { CiudadService } from './services/ciudad.service';

import { IndexComponent } from './pages/index/index.component';
import { AdminCarrerasComponent } from './pages/admin-carreras/admin-carreras.component';
import { JuegoCiudadListadoComponent } from './pages/juego-ciudad-listado/juego-ciudad-listado.component';
import { JuegoCiudadTransaccionComponent } from './pages/juego-ciudad-transaccion/juego-ciudad-transaccion.component';
import { JuegoComercioComponent } from './pages/juego-comercio/juego-comercio.component';
import { JuegoBodegaComponent } from './pages/juego-bodega/juego-bodega.component';
import { AdminAlumnosComponent } from './pages/admin-alumnos/admin-alumnos.component';
import { AdminProfesoresComponent } from './pages/admin-profesores/admin-profesores.component';
import { AdminGruposComponent } from './pages/admin-grupos/admin-grupos.component';
import { AdminGruposDetalleComponent } from './pages/admin-grupos-detalle/admin-grupos-detalle.component';
import { ProfesorCiudadComponent } from './pages/profesor-ciudad/profesor-ciudad.component';

const routes:Route[] = [
  {path: 'index', component: IndexComponent},
  {path: 'carreras', redirectTo: '/index'},
  {path: 'carreras/:id', redirectTo: '/index'},
  {path: 'ciudades', component: JuegoCiudadListadoComponent},
  {path: 'comercio', component: JuegoComercioComponent},
  {path: 'ciudades/:cityId/intercambio', component: JuegoCiudadTransaccionComponent},
  {path: 'bodega', component: JuegoBodegaComponent},
  {path: 'juegos/detalle', redirectTo: '/index'},
  {path: 'about', redirectTo: '/index'},
  {path: 'admin/alumnos', component: AdminAlumnosComponent, canActivate: [UsuarioGuard]},
  {path: 'admin/profesores', component: AdminProfesoresComponent, canActivate: [UsuarioGuard]},
  {path: 'admin/carreras', component: AdminCarrerasComponent, canActivate: [UsuarioGuard]},
  {path: 'admin/grupos', component: AdminGruposComponent, canActivate: [UsuarioGuard]},
  {path: 'admin/grupos/detalle', component: AdminGruposDetalleComponent, canActivate: [UsuarioGuard]},
  {path: 'profesor/:cityId/ciudad', component: ProfesorCiudadComponent},
  {path: '**', redirectTo: '/index', pathMatch: 'full'},
]

@NgModule({
  declarations: [
    RootComponent,
    SidebarComponent,
    IndexComponent,
    AdminCarrerasComponent,
    ModalComponent,
    JuegoCiudadListadoComponent,
    JuegoCiudadTransaccionComponent,
    AdminAlumnosComponent,
    AdminProfesoresComponent,
    AdminGruposComponent,
    AdminGruposDetalleComponent,
    JuegoComercioComponent,
    ProfesorCiudadComponent,
    JuegoBodegaComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    CollapseModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    PopoverModule.forRoot(),
    BsDropdownModule.forRoot(),
    AlertModule.forRoot(),
    NgxBootstrapSwitchModule.forRoot(),
  ],
  providers: [GeneralService, DataService, CiudadService],
  bootstrap: [RootComponent]
})
export class AppModule { }
