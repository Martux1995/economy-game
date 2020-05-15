import http from 'http';
import SocketIO from 'socket.io';
import moment from 'moment';

import { CityQueue } from '../classes/CityQueue';

export interface ExtendedSocket extends SocketIO.Socket {
    token?: string;
    auth?: boolean;
    gameId?: number;
    teamId?: number;
    playerId?: number;
    commerceRoomId?: number;
}
/*
interface CommerceRoom {
    roomId: number,
    team1:ExtendedSocket,
    team2:ExtendedSocket,
    team1Trade: any,
    team2Trade: any
}*/

const connectedTeams:ExtendedSocket[] = [];

const cities:CityQueue[] = [];
//const commerceRoom:CommerceRoom[] = [];

const findTeamById = (teamId:number|undefined) => {
    if(typeof teamId =="undefined") return null;
    return connectedTeams.find(t => t.teamId = teamId);
}

let roomId = 0;
export default function createWebSocketServer (server:http.Server) {
    const ws = SocketIO(server);

    ws.use((socket:ExtendedSocket,next) => {
        const token = socket.handshake.query.token;
        if (token) {
            socket.token = token;
            socket.auth = true;
            next()
        } else {
            next(new Error('auth error'));
        }
    })

    // Events
    ws.on('connection', (socket:ExtendedSocket) => {
        // VALIDAR EL TOKEN PARA SABER SI PUEDE CONECTARSE
        const token = socket.handshake.query.token;
        if (true) {
            connectedTeams.push(socket);
        } else {
            socket.emit('ERROR','AUTH_FAILED');
            socket.disconnect();
        }

        // OBTENER EL LISTADO DE EQUIPOS CONECTADOS
        socket.on('team-list', () => {
            
        });

        // // SOLICITAR UN INTERCAMBIO CON UN EQUIPO
        // socket.on('team-commerce-request', (id) => {
        //     let team = findTeamById(id);
        //     if(team) {
        //         team.emit('team-commerce-notify', )
        //     }
        // });

        // // ACEPTAR O RECHAZAR LA SOLICITUD DE INTERCAMBIO
        // socket.on('team-commerce-request-action', () => {

        // });

        // // AGREGANDO O QUITANDO LOS PRODUCTOS Y DINERO A CAMBIAR
        // socket.on('team-commerce-data-change', (data) => {
        //     const values = JSON.parse(data);
        // });

        // // 
        // socket.on('team-commerce-reject', () => {

        // });

        // PONER EN COLA PARA ENTRAR A LA CIUDAD
        socket.on('city-queue', (data) => {
            const x = cities.find(val => val.isThisCity(socket.teamId!,data.cityId));
            if (x) {
                if (x.teamInQueue(socket))
                    socket.emit('team-in-queue');
                else
                    x.putInQueue(socket);
            } else {
                data = JSON.parse(data);
                console.log(data);
                
                const y = new CityQueue(1,data.cityId);
                y.init()
                .then(() => {
                    y.putInQueue(socket);
                    cities.push(y);
                })
                .catch((err) => { console.log(err);
                 socket.emit('invalid-city') });
            }
        });

        // GENERAR LA COMPRA EN LA CIUDAD SI CUMPLE LAS CONDICIONES
        socket.on('city-buy', () => {

        });

        // AL DESCONECTAR, CERRAR TODO Y ELIMINAR AL TEAM DE LOS LISTADOS
        socket.on('disconnect', () => {
            let team = findTeamById(socket.teamId);
            if(team) {
                
            }
            socket.broadcast.emit('team-disconnected',socket.teamId);
        })

        // EVENTO DE CHEQUEO DE LA COLA DE CIUDADES
        setInterval(() => {
            const actualTime = moment();
            cities.map((q =>  {

                // Comprueba que la ciudad no esté cerrada. Si es así, entonces atiende a los clientes. 
                // Sino, la elimina de la lista
                if (!q.isClosed(actualTime)) {
                    q.attendQueue(actualTime);
                } else {
                    cities.splice(cities.lastIndexOf(q),1);
                }

            }))
        },5000);
    })

    return ws;
}