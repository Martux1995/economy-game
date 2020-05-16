import http from 'http';
import SocketIO, { Socket } from 'socket.io';
import moment from 'moment';

import UserWS from '../classes/userWS';
import CityQueue from '../classes/cityQueue';

import { GameWS } from '../interfaces/webSocket';

// Array que almacena los equipos conectados.
const connectedTeachers:UserWS[] = [];
const connectedAdmins:UserWS[] = [];

const games:GameWS[] = [];

let roomId = 0;
export default function createWebSocketServer (server:http.Server) {
    const ws = SocketIO(server);

    ws.use((socket:Socket,next) => {
        const token = socket.handshake.query.token;
        if (token) {
            next()
        } else {
            next(new Error('auth-error'));
        }
    })

    // Events
    ws.on('connection', async (socket:Socket) => {

        // VALIDAR EL TOKEN PARA SABER SI PUEDE CONECTARSE
        const token = socket.handshake.query.token;
        const user = new UserWS(socket,token);
        await user.init().then(d => {
            if (user.getRol() == "JUGADOR"){
                let game = games.find(g => g.gameId == user.getGameId());
                if (game) {
                    for (const t of game.teams) {
                        t.getSocket().emit('team-connected');
                    }
                    game.teams.push(user);
                } else
                    games.push({gameId: user.getGameId(), teams: [user], cities:[],rooms:[]});
            }
            if (user.getRol() == "PROFESOR")        connectedTeachers.push(user);
            if (user.getRol() == "ADMINISTRADOR")   connectedAdmins.push(user);
        }).catch((err:Error) => {
            user.getSocket().emit('disconnected',{reason: err.message});
            user.getSocket().disconnect(true);
        });

        // OBTENER EL LISTADO DE EQUIPOS CONECTADOS
        user.getSocket().on('team-list', () => {
            let game = games.find(g => g.gameId == user.getGameId());
            if (game)
                user.getSocket().emit('team-list',game.teams.map(r => { 
                    return { teamId: r.getTeamId(), teamname: r.getTeamName() }
                }));
        });

        // PONER EN COLA PARA ENTRAR A LA CIUDAD
        user.getSocket().on('city-queue', async (data) => {
            data = JSON.parse(data);

            // Comprobamos si el usuario ya está haciendo cola para otra ciudad
            let pc = user.getCity();
            if(pc) {
                if(pc.getCityId() == data.cityId)
                    user.getSocket().emit('waiting',pc.getWaitingTime(user));
                else
                    user.getSocket().emit('in-other-queue',pc.getCityId());
                return;
            }

            // Comprobamos si existe el juego.
            let game = games.find(g => g.gameId == user.getGameId());
            if (!game) {
                user.getSocket().emit('unknown-city-error',data.cityId);
                return;
            }

            // Comprobamos si existe la ciudad. Si no, la creamos
            let city = game.cities.find(c => c.getCityId() === data.cityId);
            if (!city) {
                city = new CityQueue(user.getGameId(),data.cityId);
                let x = await city.init().catch((err:Error) => {
                    user.getSocket().emit(err.message,data.cityId);
                    return false;
                });
                if (x)  game.cities.push(city);
                else    return;
            }
            
            // Colocamos al equipo en la cola correspondiente
            if (city.teamInCity(user))  user.getSocket().emit('waiting',city.getWaitingTime(user));
            else                        city.putInQueue(user);
        });

        // GENERAR LA COMPRA EN LA CIUDAD SI CUMPLE LAS CONDICIONES
        user.getSocket().on('city-trade', (data) => {
            data = JSON.parse(data);
            user.cityTrade(data);
        });

        user.getSocket().on('exit-city', () => {
            user.deleteCity();
        })

        // // SOLICITAR UN INTERCAMBIO CON UN EQUIPO
        // socket.on('team-commerce-request', (id) => {
        //     let user = findTeamById(id);
        //     if(user) {
        //         user.emit('team-commerce-notify', )
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

        // AL DESCONECTAR, CERRAR TODO Y ELIMINAR AL TEAM DE LOS LISTADOS
        user.getSocket().on('disconnect', () => {
            if (user.getRol() == "JUGADOR") {
                let game = games.find(g => g.gameId == user.getGameId());
                if (game) {
                    user.deleteCity();
                    // user.deleteRoom();
                    game.teams.splice(game.teams.indexOf(user),1);
                    for (const t of game.teams) {
                        t.getSocket().emit('team-disconnected',user.getTeamId());
                    }
                }
            }
            if (user.getRol() == "PROFESOR") connectedTeachers.splice(connectedTeachers.indexOf(user),1);
        })
    });

    // EVENTO DE CHEQUEO DE LA COLA DE CIUDADES
    setInterval(() => {
        const actualTime = moment();
        games.map((g =>  {
            g.cities.map(c => {
                // Comprueba que la ciudad no esté cerrada. Si es así, entonces atiende a los clientes. 
                // Sino, la elimina de la lista
                if (!c.isClosed(actualTime)) {
                    c.attendQueue(actualTime);
                } else {
                    c.closeCity();
                    g.cities.splice(g.cities.indexOf(c),1);
                }
            });
        }))
    },1000);

    return ws;
}