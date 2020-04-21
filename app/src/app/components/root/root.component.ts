import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Grupo } from 'src/app/interfaces/grupo';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent {

  public isMenuOpen:boolean = false;

  public showModal:boolean = false;

  public menuTitle:string = 'Juego de Comercio';

  public groupInfo:Grupo;

  idTeam = new FormControl('');
  email = new FormControl('');
  pass = new FormControl('');
  
  constructor(private http:DataService) { }

  ngOnInit() {
    this.http.getGroupData(1).subscribe(d => {
      this.groupInfo = d.data;
    })
  }

  print( ok:boolean ) {
    console.log(ok);
    //console.log(`${this.idTeam.value} ${this.email.value} ${this.pass.value}`)
    this.showModal = false;
    this.email.setValue('');
  }

}
