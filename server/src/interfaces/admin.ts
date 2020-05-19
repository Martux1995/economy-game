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
    id_juego:number;
    fecha_termino:string;
    nombre:string;
    semestre:string;
    concluido:boolean;
    fecha_inicio:string;
    dinero_inicial:number;
    veces_compra_ciudad_dia:number;
    se_puede_comerciar:boolean;
    se_puede_comprar_bloques:boolean;
    max_bloques_camion:number;
    max_bloques_bodega:number;
    precio_bloque_extra:number;
    freq_cobro_bloque_extra_dias:number;
    prox_cobro_bloque_extra:string;
    valor_impuesto:number;
    freq_cobro_impuesto_dias:number;
    prox_cobro_impuesto:string;
    freq_rotacion_lideres_dias:number;
    prox_rotacion_lideres:string;
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

