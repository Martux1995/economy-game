import { Injectable } from "@angular/core";
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { Observable } from 'rxjs';

@Injectable()
export class WebSocketService {

    socket:any;
    readonly uri:string = environment.urlApi;

    constructor(private userService:UserService) { }

    loadWS() {
        if(!this.socket || this.socket.disconnected) {
            this.socket = io(this.uri,{ query: { token: this.userService.getToken() } });
        }
    }

    listen(eventName:string) {
        return new Observable((subscriber) => {
            this.socket.on(eventName, (data) => {
                subscriber.next(data);
            })
        })
    }

    emit(eventName:string, data:{}){
        this.socket.emit(eventName,JSON.stringify(data));
    }
}