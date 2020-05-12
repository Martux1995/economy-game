import { Component, OnInit } from '@angular/core';
import { WebSocketService } from 'src/app/services/ws.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-juego-comercio',
  templateUrl: './juego-comercio.component.html',
  styleUrls: ['./juego-comercio.component.scss']
})
export class JuegoComercioComponent implements OnInit {

  constructor(
    private userService:UserService,
    private socketService:WebSocketService
  ) { }

  // Aqui queremos escuchar un evento
  ngOnInit(): void {
    this.socketService.listen('message').subscribe((data) => {
      console.log(data);
    })
  }

  sendMessage() {
    this.socketService.emit('message',{asd:1});
  }

}
