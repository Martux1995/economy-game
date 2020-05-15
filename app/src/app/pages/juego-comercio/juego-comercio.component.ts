import { Component, OnInit } from '@angular/core';
import { WebSocketService } from 'src/app/services/ws.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-juego-comercio',
  templateUrl: './juego-comercio.component.html',
  styleUrls: ['./juego-comercio.component.scss']
})
export class JuegoComercioComponent implements OnInit {

  public socketData:FormGroup;

  constructor(
    private socketService:WebSocketService,
    private formBuilder: FormBuilder
  ) { }

  // Aqui queremos escuchar un evento
  ngOnInit(): void {
    this.socketData = this.formBuilder.group({msg: '', data: ''});
    /*this.socketService.listen('message').subscribe((data) => {
      console.log(data);
    })*/
  }

  sendMessage(data) {
    this.socketService.emit(data.msg,{cityId: Number(data.data)});
  }

}
