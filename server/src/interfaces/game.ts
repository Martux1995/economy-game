
/** DATOS DEL JUEGO PARA LOS JUGADORES */
export interface GameData {
    idJuego:number;
    sePuedeComprarBloques:boolean;
    precioBloqueExtra:number;
    vecesCompraCiudadDia:number;
}

/** DATOS DE LA CIUDAD PARA LOS JUGADORES */
export interface GameCity {
    idCiudad:number;
    nombre:string;
    urlImagen:string;
    descripcion:string;
    horaAbre:string;
    horaCierre:string;
}

/** DATOS DEL PRODUCTO DE UNA CIUDAD PARA LOS JUGADORES */
export interface GameCityProduct {
    idProducto:number;
    nombre:string;
    bloques:number;
    stock:number;
    precioCompra:number;
    precioVenta:number;
}

/** DATOS DE UN PRODUCTO DEL JUEGO PARA LOS JUGADORES */
export interface GameProduct {
    idProducto:number;
    nombre:string;
    bloques:number;
}

/** DATOS DEL PRODUCTO A CAMBIAR EN UNA CIUDAD */
export interface TradeItems {
    idProducto: number;
    esCompra: boolean;
    cantidad: number;
}

/** INFORMACIÓN DEL CAMIÓN PARA LOS JUGADORES */
export interface GameTruck {
    bloquesEnUso:number
}

/** PRODUCTOS A CAMBIAR ENTRE BODEGA Y CAMIÓN */
export interface ChangeItems {
    idProducto: number;
    cargando: boolean;
    cantidad: number;
}

/** DATOS DE LOS BLOQUES ARRENDADOS POR UN EQUIPO PARA LOS JUGADORES */
export interface GameRentedBlocks {
    bloquesExtra:number;
    arriendoBloquesExtra:boolean;
    fechaCobro:string;
    precioBloqueExtra:number;
}