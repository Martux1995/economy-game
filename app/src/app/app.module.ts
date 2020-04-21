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

import { RootComponent } from './components/root/root.component';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ModalComponent } from './components/modal/modal.component';

import { DataService } from './services/data.service';
import { CiudadService } from './services/ciudad.service';

import { IndexComponent } from './pages/index/index.component';
import { AdminCarrerasComponent } from './pages/admin-carreras/admin-carreras.component';
import { CiudadSeleccionComponent } from './pages/ciudad-seleccion/ciudad-seleccion.component';
import { CiudadTransaccionComponent } from './pages/ciudad-transaccion/ciudad-transaccion.component';

const routes:Route[] = [
  {path: 'index', component: IndexComponent},
  {path: 'carreras', redirectTo: '/index'},
  {path: 'carreras/:id', redirectTo: '/index'},
  {path: 'ciudades', component: CiudadSeleccionComponent},
  {path: 'ciudades/:cityId/intercambio', component: CiudadTransaccionComponent},
  {path: 'juegos/detalle', redirectTo: '/index'},
  {path: 'about', redirectTo: '/index'},
  {path: 'admin/alumnos', redirectTo: '/index'},
  {path: 'admin/profesores', redirectTo: '/index'},
  {path: 'admin/carreras', component: AdminCarrerasComponent},
  {path: '**', redirectTo: '/index'},
]

@NgModule({
  declarations: [
    RootComponent,
    SidebarComponent,
    IndexComponent,
    AdminCarrerasComponent,
    ModalComponent,
    CiudadSeleccionComponent,
    CiudadTransaccionComponent
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
    PopoverModule.forRoot()
  ],
  providers: [DataService, CiudadService],
  bootstrap: [RootComponent]
})
export class AppModule { }
