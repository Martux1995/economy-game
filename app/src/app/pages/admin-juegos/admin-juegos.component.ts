import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-juegos',
  templateUrl: './admin-juegos.component.html',
  styleUrls: ['./admin-juegos.component.scss']
})
export class AdminJuegosComponent implements OnInit {
  
  public showModalFinish = false;

  constructor( private router: Router) { }

  ngOnInit(): void {
  }

  finishGame($event){
    this.showModalFinish = false;
  }

  goDetailGame(){
    this.router.navigate(['admin/juegos/detalle']);
  }

}
