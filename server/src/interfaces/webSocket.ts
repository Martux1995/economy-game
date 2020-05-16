import UserWS from "../classes/userWS";
import CityQueue from "../classes/cityQueue";

export interface GameWS {
    gameId:number;
    teams:UserWS[];
    cities:CityQueue[];
    rooms:Room[];
}

// FALTA UN MÉTODO PARA OBTENER LOS JUEGOS DE LOS PROFESORES
export interface GameTeachers {
    gameId:number;
    teachers:UserWS[];
}

export interface Room {
    roomId:number;
    team1:UserWS;
    team2:UserWS;
    //itemsTeam1:[];
    //itemsTeam2:[];
}
