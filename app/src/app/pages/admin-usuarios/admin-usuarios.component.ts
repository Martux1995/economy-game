import { Component, OnInit } from '@angular/core';
import { Usuarios } from 'src/app/interfaces/admin';
import { DataTableHeaderData } from 'src/app/components/datatable/datatable.component';
import { GeneralService } from 'src/app/services/general.service';
import { DataService } from 'src/app/services/data.service';
import { LoginService } from '../../services/login.service';
import { ErrorResponse } from 'src/app/interfaces/response';

@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.scss']
})
export class AdminUsuariosComponent implements OnInit {

  public esAdmin = true;
  public habilitado = false;

  // DATATABLES Usuarios
  listaUsuarios: Usuarios[] = [];

  headersUsuarios: DataTableHeaderData[] = [
    { name: 'ID',       id: 'id',     type: 'text', hide: true },
    { name: 'IDP',       id: 'idPersona',   type: 'text', hide: true },
    { name: 'RUT',      id: 'rut',      type: 'text' },
    { name: 'Nombre',   id: 'nombre',      type: 'text' },
    { name: 'Rol',      id: 'rol',      type: 'text' },
    { name: 'Estado',   id: 'estado',      type: 'text' },
    { name: 'Acciones', id: 'actions',     type: 'button',
            props: [{action: this.showTicket, text: 'Rol', classes: 'btn-warning'},
                    {action: this.showTicket, text: 'Activar', classes: ' ml-1 btn-info'},
                    {action: this.showTicket, text: 'Desactivar', classes: ' ml-1 btn-success'}]
    },
  ];

  constructor(private genServ: GeneralService,
              private dataService: DataService,
              private loginService: LoginService) { }

  async ngOnInit(){
    await this.getAllUsers();
  }

  getAllUsers(){
    this.genServ.showSpinner();

    this.dataService.getAllUsers().subscribe(resp => {
      this.listaUsuarios = resp.data.map(p => {
        let valido;
        if (p.vigente){
          valido = 'Vigente';
        } else {
          valido = 'No Vigente';
        }
        return {
          idUsuario: p.idUsuario,
          idPersona: p.idPersona,
          nombre: p.nombre,
          rut: p.rut,
          rol: p.nombreRol,
          estado: valido,
        };
      });
      this.genServ.hideSpinner();
    }, (err: ErrorResponse) => {
      if (err.status === 400) {
        switch (err.error.code) {
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.loginService.setLogout();
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            break;
          }
          default: {
            this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
          }
        }
      } else {
        this.genServ.showToast("ERROR DESCONOCIDO",`Error interno del servidor.`,"danger");
        console.log(err);
      }
      this.genServ.hideSpinner();
    });
  }

  showTicket(){
  }

}
