import { Injectable } from "@angular/core";
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';
import { Observable } from 'rxjs';

@Injectable()
export class WebSocketService {

 
    socket:SocketIOClient.Socket;
    readonly uri:string = environment.urlWs;

    constructor(private loginService:LoginService) { 
        this.loginService.sessionStatus.subscribe(r => {
            if (r)  this.loadWS();
            else if (this.socket) this.socket.close();
        })
    }

    loadWS() {
        if(!this.socket || this.socket.disconnected) {
            this.socket = io(this.uri,{ query: { token: this.loginService.getToken() } });
        }
    }

    // ListenCityStatus({msg: function})
    listen(eventName:string) : Observable<any>{
        return new Observable((subscriber) => {
            this.socket.on(eventName, (data) => {
                subscriber.next(data);
            })
        })
    }

    emit(eventName:string, data:{} = {}){
        this.socket.emit(eventName,JSON.stringify(data));
    }
}