export interface Juego {
    idJuego:number;
    nombre:string;
    semestre:string;
    concluido:boolean;
    fechaInicio:string;
    fechaTermino:string;
}

export interface JuegoDetalle {
    idJuego:number;
    nombre:string;
    semestre:string;
    concluido:boolean;
    fechaInicio:string;
    fechaTermino:string;
    dineroInicial:number;
    vecesCompraCiudadDia:number;
    sePuedeComerciar:boolean;
    sePuedeComprarBloques:boolean;
    maxBloquesCamion:number;
    maxBloquesBodega:number;
    precioBloqueExtra:number;
    freqCobroBloqueExtraDias:number;
    proxCobroBloqueExtra:string;
    valorImpuesto:number;
    freqCobroImpuestoDias:number;
    proxCobroImpuesto:string;
    freqRotacionLideresDias:number;
    proxRotacionLideres:string;
}

export interface Ciudad {
    idCiudad:number;
    nombreCiudad:string;
    urlImagen:string;
    descripcion:string;
    horaAbre:string;
    horaCierre:string;
    idJuego:number;
    idProfesor:number;
    vigente: boolean;
}

export interface CiudadProducto {
    idProducto:number;
    nombreProducto:string;
    bloques:number;
    stockActual:number;
    stockMax:number;
    precioMin:number;
    precioMax:number;
    factorCompra:number;
    factorVenta:number;
    precioCompra:number;
    precioVenta:number;
}

export interface CiudadUpdateData {
    nombreCiudad:string;
    descripcion:string;
    horaAbre:string;
    horaCierre:string;
}

export interface ProductUpdateData {
    idProducto:number;
    stockActual:number;
    stockMax:number;
    precioMin:number;
    precioMax:number;
    factorVenta:number;
}

// INTERFACES PARA EL JUEGO EN SÍ

/** DATOS DEL JUEGO PARA LOS JUGADORES */
export interface GamePlayerData {
    idJuego:number;
    sePuedeComprarBloques:boolean;
    precioBloqueExtra:number;
    vecesCompraCiudadDia:number;
}

/** DATOS DE LA CIUDAD PARA LOS JUGADORES */
export interface GamePlayerCity {
    idCiudad:number;
    nombre:string;
    urlImagen:string;
    descripcion:string;
    horaAbre:string;
    horaCierre:string;
}

/** DATOS DEL PRODUCTO DE UNA CIUDAD PARA LOS JUGADORES */
export interface GamePlayerCityProduct {
    idProducto:number;
    nombre:string;
    bloques:number;
    stock:number;
    precioCompra:number;
    precioVenta:number;
}

/** DATOS DE UN PRODUCTO DEL JUEGO PARA LOS JUGADORES */
export interface GamePlayerProduct {
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
export interface GamePlayerTruck {
    bloquesEnUso:number
}

/** PRODUCTOS A CAMBIAR ENTRE BODEGA Y CAMIÓN */
export interface ChangeItems {
    idProducto: number;
    cargando: boolean;
    cantidad: number;
}

/** DATOS DE LOS BLOQUES ARRENDADOS POR UN EQUIPO PARA LOS JUGADORES */
export interface GamePlayerRentedBlocks {
    bloquesExtra:number;
    arriendoBloquesExtra:boolean;
    fechaCobro:string;
    precioBloqueExtra:number;
}