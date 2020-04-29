import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-grupos',
  templateUrl: './admin-grupos.component.html',
  styleUrls: ['./admin-grupos.component.scss']
})
export class AdminGruposComponent implements OnInit {

  public showModalDisable:boolean = false;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  showDetailGroup(){
    this.router.navigate(['admin/grupos/detalle']);
  }

  disableGroup( ok:boolean ){
    console.log(ok);
    this.showModalDisable = false;
  }
}
