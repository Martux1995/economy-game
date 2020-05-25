import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.scss']
})
export class AdminUsuariosComponent implements OnInit {

  public esAdmin = true;
  public habilitado = false;

  constructor() { }

  ngOnInit(): void {
  }

}
