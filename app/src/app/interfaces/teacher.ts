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

// INTERFACES PARA MANEJAR LO QUE SE ENVÍA AL SERVIDOR

export interface CiudadData {
    nombreCiudad:string;
    descripcion:string;
    horaAbre:string;
    horaCierre:string;
}

export interface ProductData {
    idProducto:number;
    stockActual:number;
    stockMax:number;
    precioMin:number;
    precioMax:number;
    factorVenta:number;
}

