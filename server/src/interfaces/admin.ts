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
    fechaTermino:string;
    nombre:string;
    semestre:string;
    concluido:boolean;
    fechaInicio:string;
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

export interface Jugador {
    idJugador:number;
    idAlumno:number;
    idGrupo:number|null;
    vecesDesignado:number;
    vigente:boolean;
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

