import { Component, OnInit } from '@angular/core';
import { WebSocketService } from 'src/app/services/ws.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-juego-comercio',
  templateUrl: './juego-comercio.component.html',
  styleUrls: ['./juego-comercio.component.scss']
})
export class JuegoComercioComponent implements OnInit {

  constructor(
    private loginService:LoginService,
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
