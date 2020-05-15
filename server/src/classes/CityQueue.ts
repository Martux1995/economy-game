import { ExtendedSocket } from "../middleware/webSocket";
import moment, { Moment } from "moment";
import GameModel from "../models/game";

export class CityQueue {

    private gameId:number;
    private cityId:number;
    private cityQueue: ExtendedSocket[];
    private actualTeam: ExtendedSocket | null;
    private timeToGo: Moment | null;
    private openTime: Moment | null;
    private closeTime: Moment | null;

    /**
     * Construye la clase CityQueue, pero no la define. Hay que llamar a init() para iniciarla.
     * @param gameId El id del juego al que pertenece la ciudad
     * @param cityId La ciudad
     */
    constructor (gameId:number, cityId:number) { 
        this.gameId = gameId;
        this.cityId = cityId;
        this.cityQueue = [];
        this.actualTeam = null;
        this.timeToGo = null;
        this.openTime = null;
        this.closeTime = null
    }

    /**
     * Inicia la clase con los datos de la ciudad
     */
    async init() : Promise<boolean> {
        // id_ciudad, nombre, url_imagen, descripcion, hora_abre, hora_cierre
        const data = await GameModel.getGameCityById(this.gameId,this.cityId);
        //console.log(data);
        
        if (data) {
            this.openTime = moment(data.horaAbre,'HH:mm:ss');
            this.closeTime = moment(data.horaCierre,'HH:mm:ss');
            return true;
        } else {
            return false;
            //throw new Error('CITY_NOT_EXISTS');
        }
    }

    getCityId() : number { return this.cityId; }

    /**
     * Comprueba con los id si esta es la ciudad buscada
     * @param gameId El id del juego de la ciudad
     * @param cityId El id de la ciudad
     */
    isThisCity(gameId:number, cityId:number) : boolean {
        return this.cityId == cityId && this.gameId == gameId;
    }

    /**
     * Busca un equipo en la cola. Si lo encuentra lo retorna, sino, retorna null.
     * @param team El equipo a buscar en la cola de la ciudad
     */
    teamInQueue (team:ExtendedSocket) : ExtendedSocket | null {
        if (this.actualTeam && this.actualTeam.teamId == team.teamId)
            return this.actualTeam;

        for (const queueTeam of this.cityQueue) {
            if (queueTeam.teamId == team.teamId) {
                return queueTeam;
            }
        }
        return null;
    }
    
    /**
     * Comprueba si existen equipos en cola para entrar a la ciudad
     */
    hasWaitingTeams () : boolean {
        return this.cityQueue.length > 0;
    }

    /**
     * Retorna la cantidad de equipos existentes en la cola para entrar a la ciudad
     */
    getTotalWaitingTeams () : number{
        return this.cityQueue.length;
    }

    /**
     * Comprueba si la ciudad está cerrada. Si es así, entonces bota a todos los jugadores con el mensaje `city-closed`.
     */
    isClosed (now:Moment) : boolean {
        if (this.openTime && this.closeTime)
            if (now < this.openTime || now > this.closeTime) {
                this.sendMessageToQueue('city-closed');
                this.actualTeam!.emit('city-closed');
                this.actualTeam = null;
                this.cityQueue = [];
                return true;
            } else {
                return false;
            }
        else
            throw new Error('CITY_NOT_BUILDED');
    }

    /**
     * Coloca al grupo especificado en la cola. Si no hay equipos atendiéndose, se ingresa automaticamente
     * y se le notifica con el mensaje `attended`. Caso contrario, se ingresa a la cola con el mensaje `in-queue`.
     * @param group El grupo que será puesto en cola o atendido inmediatamente
     */
    putInQueue (group:ExtendedSocket) {
        if (this.actualTeam && this.timeToGo) {
            this.cityQueue.push(group);
            group.emit('in-queue',{time: 300 * (this.cityQueue.length - 1) + this.timeToGo.diff(moment(),'s')});
        } else {
            this.timeToGo = moment().add(5,'m');
            this.actualTeam = group;
            if (this.actualTeam) {
                GameModel.getAllGameCityProducts(this.gameId, this.actualTeam.teamId!,this.cityId)
                .then((data) => {
                    this.actualTeam!.emit('attended',{time: this.timeToGo, products: data});
                }).catch((err) => this.actualTeam!.emit('unknown-error'));
            }
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
                this.actualTeam.emit('city-time-exceded');
                this.attendNewTeam(time);
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
            this.timeToGo = this.actualTeam ? time.add(5,'m') : null;
            if (this.actualTeam) {
                GameModel.getAllGameCityProducts(this.gameId, this.actualTeam.teamId!,this.cityId)
                .then((data) => {
                    this.actualTeam!.emit('attended',{time: this.timeToGo, products: data});
                }).catch((err) => this.actualTeam!.emit('unknown-error'));
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
    deleteTeam (team:ExtendedSocket) {
        if (this.actualTeam && this.actualTeam.teamId == team.teamId) {
            this.actualTeam.emit('exit-city');
            this.attendNewTeam(moment());
            
        } else if (this.teamInQueue(team)) {
            this.cityQueue.splice(this.cityQueue.lastIndexOf(team),1);
            team.emit('exit-city');
            this.sendMessageToQueue('queue-move');
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
                team.emit(message,{time: 300 * (this.cityQueue.length - 1) + this.timeToGo!.diff(moment(),'s')})
                continue;
            }
            if (message == 'city-closed') {
                team.emit('city-closed');
                continue;
            }
        }
    }

}