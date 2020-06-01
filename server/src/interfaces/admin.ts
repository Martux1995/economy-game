export interface Persona {
    idPersona:number;
    rut:string;
    nombre:string;
    apellidoP:string;
    apellidoM:string | null;
    correoUcn:string;
}

export interface PersonaSinUsuario {
    idPersona:number;
    rut:string;
    nombre:string;
    apellidoP:string;
    apellidoM:string | null;
    correoUcn:string;
    nombreGrupo:string | null;
    rol:'ADMINISTRADOR'|'PROFESOR'|'JUGADOR';
    idUsuario?:number;
    claveGenerada?:string;
}

export interface Juego {
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
    freqGeneracionReporteDias:number;
    proxGeneracionReporte:string;
}

export interface Jugador {
    idPersona:number;
    rut:string;
    nombre:string;
    apellidoP:string;
    apellidoM:string | null;
    correoUcn:string;
    userCreated:boolean;
    idAlumno:number;
    idCarrera:number;
    idJugador:number;
    idJuego:number;
    vecesDesignado:number;
    idGrupo:number|null;
    nombreGrupo:string;
    dineroActual:number;
    bloquesExtra:number;
    idJugadorDesignado:number;
}

export interface Grupo {
    idGrupo:number;
    nombreGrupo:string;
    dineroActual:number;
    bloquesExtra:number;
    idJugadorDesignado:number | null;
    idJuego:number;
    vigente:boolean;
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
    vigente:boolean;
}

export interface Producto {
    idProducto:number;
    nombre:string;
    bloquesTotal:number;
    idJuego:number;
    vigente:boolean;
}

export interface Reporte {
    idReporte:number;
    idGrupo:number;
    fechaInicio:string;
    fechaFin:string;
    saldoFinal:number;
    ingreso:number;
    egreso:number;
    utilidad:number;
}

export interface ReporteStock {
    idReporte:number;
    idProducto:number;
    stockCamion:number;
    stockBodega:number;
}

export interface ReportExcelData {
    idGrupo:number; 
    nombreGrupo:string; 
    fechaInicio:string;
    fechaFin:string;
    nombrePersona:string;
    apellidoP:string;
    apellidoM:string | null;
    saldoFinal:number;
    bloquesExtra:number;
    ingreso:number;
    egreso:number;
    utilidad:number;
    stock: {
        idProducto:number;
        stockBodega:number;
        stockCamion:number;
    }[] | null;
    transacciones: {
        idIntercambio:number;
        fechaIntercambio:string;
        idCiudad:number;
        detalle: {
            idProducto:number;
            esCompra:'COMPRA'|'VENTA';
            cantidad:number;
            precioUnitario:number;
        }[];
    }[] | null;
}

export interface StudentData {
    id?: number;
    nombres?: string;
    apellidoP?: string;
    apellidoM?: string | null;
    rut?: string;
    correo?: string;
};

export interface GroupData {
    id?:number;
    nombreGrupo?:string;
    ruts?:string[];
}

export interface Jugadores {
    idJugador:number;
    idAlumno:number;
    idGrupo:number|null;
    nombres?: string;
    apellidoP?: string;
    apellidoM?: string | null;
    rut?: string;
    nombreGrupo?: string;
}

