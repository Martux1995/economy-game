import { Socket } from 'socket.io';

import Token from './token';
import Crypt from './crypt';
import CityQueue from './cityQueue';

import { TradeItems } from '../interfaces/game';

import AuthModel from '../models/auth';

export default class UserWS {

    // Indica si la clase está lista para ejecutar sus funciones
    private initClass:boolean;

    // El socket del usuario para manejar los emit
    private teamSocket:Socket;

    // Datos de la clase
    private token:string;
    private userId:number;
    private rol:string|'ADMINISTRADOR'|'PROFESOR'|'JUGADOR';
    private gameId:number;
    private teamId:number;
    private teamName:string;
    private playerId:number;

    // 
    private city:CityQueue | null;
    private room:null;

    constructor (socket:SocketIO.Socket,token:string) {
        this.teamSocket = socket;
        this.token = token;
        this.rol = this.teamName = '';
        this.userId = this.gameId = this.teamId = this.playerId = 0;
        this.city = this.room = null;
        this.initClass = false;
    }

    public getUserId () : number    { return this.userId; }
    public getGameId () : number    { return this.gameId; }
    public getTeamId () : number    { return this.teamId; }
    public getTeamName () : string  { return this.teamName; }
    public getPlayerId () : number  { return this.playerId; }
    public getRol () : string       { return this.rol; }
    public getSocket () : Socket    { return this.teamSocket; }

    public async init () : Promise<boolean> {
        return this.checkUserAuth().then(() => this.initClass = true);
    }

    public async checkUserAuth () : Promise<boolean> {
        let tokenData = Token.checkJwtToken(this.token);
        if (!tokenData) { throw new Error('invalid-token') }

        const classData = {
            userId: Number(Crypt.decryptVal(tokenData.id)),
            teamId: typeof tokenData.team === 'string' ? Number(Crypt.decryptVal(String(tokenData.team))) : 0
        };
        
        return AuthModel.getTokenData(classData.userId,classData.teamId)
        .then(d => {
            if (!this.initClass) {
                this.userId = classData.userId;
                this.rol = d.nombreRol;
                this.gameId = Number(d.idJuego || 0);
                this.teamId = Number(d.idGrupo || 0);
                this.teamName = d.nombreGrupo || '';
                this.playerId = Number(d.idJugador || 0);
            }
            return true;
        }).catch(() => { throw new Error('invalid-token') });
    }

    public setCity (city:CityQueue | null) {
        this.city = city;
    }

    public getCity () : CityQueue | null {
        return this.city;
    }

    public deleteCity () : boolean {
        if (this.city) {
            this.city.deleteTeam(this);
            this.teamSocket.emit('exit-city');
            return true;
        }
        return false;
    }

    public cityTrade (data:TradeItems[]) {
        if (this.city)
            this.city.doTrade(this,data);
        else
            this.teamSocket.emit('not-in-city');
    }

}