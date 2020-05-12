import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxBootstrapSwitchModule } from 'ngx-bootstrap-switch';

import { AngularBootstrapToastsModule } from 'angular-bootstrap-toasts';

import { RootComponent } from './components/root/root.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ModalComponent } from './components/modal/modal.component';

import { GeneralService } from './services/general.service';
import { DataService } from './services/data.service';
import { CiudadService } from './services/ciudad.service';
import { WebSocketService } from './services/ws.service';

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
import { JuegoOtrosComponent } from './pages/juego-otros/juego-otros.component';

import routes from './app.routes';

@NgModule({
  declarations: [
    RootComponent,
    SidebarComponent,
    IndexComponent,
    ModalComponent,
    JuegoCiudadListadoComponent,
    JuegoCiudadTransaccionComponent,
    JuegoComercioComponent,
    JuegoBodegaComponent,
    JuegoOtrosComponent,
    AdminCarrerasComponent,
    AdminAlumnosComponent,
    AdminProfesoresComponent,
    AdminGruposComponent,
    AdminGruposDetalleComponent,
    ProfesorCiudadComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularBootstrapToastsModule, 
    RouterModule.forRoot(routes),
    CollapseModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    PopoverModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgxBootstrapSwitchModule.forRoot(),
  ],
  providers: [GeneralService, DataService, CiudadService, WebSocketService ],
  bootstrap: [RootComponent]
})
export class AppModule { }
