import moment, { Moment } from "moment";

import GameModel from "../models/game";

import UserWS from "./userWS";
import { TradeItems } from "../interfaces/game";
import isEmpty from "is-empty";
import { checkWebSocketError } from "../middleware/errorHandler";

export default class CityQueue {

    private initClass:boolean;

    private gameId:number;
    private cityId:number;
    private cityQueue: UserWS[];
    private actualTeam: UserWS | null;
    private timeToGo: Moment | null;
    private openTime: Moment | null;
    private closeTime: Moment | null;

    private waitTime:number;

    /**
     * Construye la clase CityQueue, pero no la define. Hay que llamar a init() para iniciarla.
     * @param gameId El id del juego al que pertenece la ciudad
     * @param cityId La ciudad
     */
    constructor (gameId:number, cityId:number) { 
        this.gameId = gameId;
        this.cityId = cityId;
        this.initClass = false;
        this.waitTime = process.env.NODE_ENV == "production" ? 5 : 1;
        this.cityQueue = [];
        this.actualTeam = this.timeToGo = this.openTime = this.closeTime = null;
    }

    /** Inicia la clase con los datos de la ciudad */
    async init() : Promise<boolean> {
        if (!this.initClass){
            const data = await GameModel.getGameCityById(this.gameId,this.cityId)
            .catch((err) => { console.log(err); throw new Error('invalid-city')});
            
            // id_ciudad, nombre, url_imagen, descripcion, hora_abre, hora_cierre
            this.openTime = moment(data.horaAbre,'HH:mm:ss');
            this.closeTime = moment(data.horaCierre,'HH:mm:ss');
            
            const now = moment();
            if (now < this.openTime || now > this.closeTime) throw new Error('city-closed');
            
            return this.initClass = true;
        }
        return false;
    }

    /** Obtiene el id de esta ciudad */
    getCityId() : number { return this.cityId; }

    /**
     * Comprueba si el equipo ya existe en la ciudad (atendiéndose o en la cola). Si
     * es así, entonces retorna la ciudad. Caso contrario, retorna `null`
     * @param team El equipo a buscar en la cola de la ciudad
     */
    teamInCity (team:UserWS) : UserWS | null {
        if (this.actualTeam == team) return team;

        for (const queueTeam of this.cityQueue) if (queueTeam == team)  return queueTeam;

        return null;
    }
    
    /** Comprueba si existen equipos en cola para entrar a la ciudad */
    hasWaitingTeams () : boolean {
        return this.cityQueue.length > 0;
    }

    /** Retorna la cantidad de equipos existentes en la cola para entrar a la ciudad */
    getTotalWaitingTeams () : number{
        return this.cityQueue.length;
    }

    /** TODO: VALIDAR */
    getWaitingTime (team?:UserWS) {
        if (this.actualTeam == team)    return 0;

        let pos = team ? this.cityQueue.indexOf(team) : this.cityQueue.length;

        if (this.timeToGo)
            return this.waitTime * 60 * pos + this.timeToGo.diff(moment(),'s');
        else
            return this.waitTime * 60 * pos;
        
    }

    /**
     * Comprueba si la ciudad está cerrada. Si es así, entonces bota a todos los 
     * jugadores con el mensaje `city-closed`.
     */
    isClosed (now:Moment) : boolean {
        if (this.initClass && this.openTime && this.closeTime)
            return (now < this.openTime || now > this.closeTime)
        else
            throw new Error('city-not-builded');
    }

    closeCity () {
        if (this.actualTeam) {
            this.actualTeam.getSocket().emit('city-closed');
            this.actualTeam = null;
        }
        this.sendMessageToQueue('city-closed');
        this.cityQueue = [];
    }

    /**
     * Coloca al grupo especificado en la cola. Si no hay equipos atendiéndose, se ingresa automaticamente
     * y se le notifica con el mensaje `attended`. Caso contrario, se ingresa a la cola con el mensaje `in-queue`.
     * @param group El grupo que será puesto en cola o atendido inmediatamente
     */
    async putInQueue (group:UserWS) {
        if (this.isClosed(moment()))    return group.getSocket().emit('city-closed',this.cityId);
        let x = await GameModel.getAllGameCityProducts(this.gameId,group.getTeamId(),this.cityId).catch(() => {
            group.getSocket().emit('max-trade-city-reached'); 
        })

        if (!x) return;

        if (this.actualTeam && this.timeToGo) {
            group.getSocket().emit('in-queue',{
                time: this.waitTime * 60 * (this.cityQueue.length) + this.timeToGo.diff(moment(),'s'),
                cityId: this.cityId
            });
            group.setCity(this);
            this.cityQueue.push(group);
        } else {
            GameModel.getAllGameCityProducts(this.gameId, group.getTeamId(),this.cityId)
            .then((data) => {
                group.setCity(this);
                this.timeToGo = moment().add(this.waitTime,'m');
                this.actualTeam = group;
                group.getSocket().emit('attended',{cityId: this.cityId, time: this.timeToGo, products: data});
            }).catch((err) => group.getSocket().emit('unknown-error'));
        }
    }

    /**
     * Comprueba el estado de la cola para saber si un grupo debe dejar la ciudad o no. Si es así, entonces se le emite
     * al grupo atendido el mensaje `city-time-exceded` y se atiende a un nuevo equipo. 
     * @param time `moment()` en el que hay que atender la cola
     */
    attendQueue (time:Moment) {
        if (this.actualTeam && this.timeToGo) {
            if (this.timeToGo < time) {
                this.actualTeam.getSocket().emit('city-time-exceded');
                this.deleteTeam(this.actualTeam);
            }
        }
    }

    /**
     * Luego se vuelve a atender la cola, y si esta no está vacia, se atiende al siguiente grupo con el mensaje `attended`.
     * @param time Momento en que se atiende la cola
     */
    attendNewTeam (time:Moment) {
        if (this.actualTeam) {
            this.actualTeam = this.cityQueue.shift() || null;
            this.timeToGo = this.actualTeam ? time.add(this.waitTime,'m') : null;
            if (this.actualTeam) {
                GameModel.getAllGameCityProducts(this.gameId, this.actualTeam.getTeamId()!,this.cityId)
                .then((data) => {
                    this.actualTeam!.getSocket().emit('attended',{cityId: this.cityId, time: this.timeToGo, products: data});
                }).catch((err) => this.actualTeam!.getSocket().emit('unknown-error'));
            }

            if (this.hasWaitingTeams()) {
                this.sendMessageToQueue('queue-move');
            }
        }
    }

    /**
     * Elimina a un equipo de la cola o ciudad. En este caso, si se puede eliminar se le avisa con el mensaje `exit-city`.
     * Luego, si existen mas equipos en la cola, se atiende al primero y se le manda el mensaje `attended`. Al resto de
     * equipos se le manda el mensaje `queue-move`. En el caso que el team estuviese en la ciudad (no en cola), se elimina y
     * se sigue atendiendo la cola.
     * @param team El equipo a eliminar de la cola
     */
    deleteTeam (team:UserWS) {
        if (this.actualTeam && this.actualTeam == team) {
            team.setCity(null);
            this.attendNewTeam(moment());
        } else if (this.teamInCity(team)) {
            this.cityQueue.splice(this.cityQueue.indexOf(team),1);
            this.sendMessageToQueue('queue-move');
        }
    }

    async doTrade (team:UserWS, data:TradeItems[]) {
        if (team == this.actualTeam) {
            if (!(data instanceof Array))   return team.getSocket().emit('list-not-found');

            const errors:any[] = [], productos:any = [], uniques:any[] = [];

            for (const p of data) {
                if (isEmpty(p)) continue;

                const pErr:any = {};
                const id = p.idProducto;
                let product = await GameModel.checkProduct(this.cityId,p.idProducto);

                if (product == null) 
                    pErr.idProducto = 'El id de producto no es válido, no existe o la ciudad no lo tiene';
                else if ( uniques.find(val => val == id) )
                    pErr.idProducto = 'No se permiten productos duplicados';
                else if (isEmpty(p.esCompra) || typeof p.esCompra !== 'boolean')
                    pErr.esCompra = 'Indique si el producto es para compra (true) o venta (false)';
                else if (typeof p.cantidad !== 'number' || Number(p.cantidad) === NaN || Number(p.cantidad) <= 0)
                    pErr.cantidad = 'Ingrese una cantidad de producto válida';

                if (!isEmpty(pErr)) { pErr.id = id; errors.push(pErr); } 
                else {
                    productos.push({ 
                        idProducto: p.idProducto, 
                        esCompra: p.esCompra, 
                        cantidad: p.cantidad 
                    });
                    uniques.push(id);
                }
            }

            if (!isEmpty(errors)) return team.getSocket().emit('wrong-data',errors);
            if (isEmpty(productos)) return team.getSocket().emit('no-trade-products');
    
            return GameModel.doTrade(this.gameId,team.getTeamId(),this.cityId,moment(),productos)
            .then(() => { 
                this.deleteTeam(team);
                team.getSocket().emit('successfull-trade');
            })
            .catch((err) => { team.getSocket().emit(checkWebSocketError(err)) });   

        } else {
            return team.getSocket().emit('not-yet',this.getWaitingTime(team));
        }

    }

    /**
     * Manda un mensaje a todos los equipos que se encuentra en la cola
     * @param message El mensaje a transmitir
     */
    sendMessageToQueue (message:'queue-move' | 'city-closed') {
        for (let i = 0; i < this.cityQueue.length; i++) {
            const team = this.cityQueue[i];
            if (message == 'queue-move') {
                team.getSocket().emit(message,{time: this.waitTime * 60 * (i - 1) + this.timeToGo!.diff(moment(),'s')})
                continue;
            }
            if (message == 'city-closed') {
                team.getSocket().emit('city-closed');
                continue;
            }
        }
    }

}