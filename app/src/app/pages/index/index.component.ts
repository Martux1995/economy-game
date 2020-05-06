import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  public nombre: string;

  constructor( private userService: UserService) { }

  ngOnInit(): void {
    this.getUserData();

  }

  async getUserData(){
    const token = await this.userService.getToken();
  }



}
