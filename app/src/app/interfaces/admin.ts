import { DTButtonData } from './dataTable';

export interface ExcelCheck<T> {
    correct: T[];
    errors: T[];
}

export interface AlumnoExcelData {
    __rowNum__?:number;
    NOMBRES?: string;
    APELLIDO_P?:string;
    APELLIDO_M?:string;
    RUT?:string;
    CORREO?:string;
}

export interface AlumnoData {
    id?: number;
    nombres: string;
    apellidoP:string;
    apellidoM?:string;
    rut:string;
    correo:string;
}

export interface GrupoExcelData {
    rowNum?:number;
    NOMBRE_GRUPO?:string;
    [propName: string]:any;
}

export interface GrupoData {
    id?:number;
    nombreGrupo:string;
    rut:string[];
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

export interface AdminAlumno {
    id?: number;
    nombre: string;
    apellidoP: string;
    apellidoM?: string;
    rut: string;
    correoUcn: string;
    idCarrera?: number;
}

export interface AdminProfesor {
    id?: number;
    nombre: string;
    apellidoP: string;
    apellidoM?: string;
    rut: string;
    correoUcn: string;
}

// DATATABLES
export interface Jugadores {
    idJugador: number;
    idAlumno: number;
    idGrupo: number;
    nombre?: string;
    rut?: string;
    vigente?: boolean;
    nombreGrupo?: string;
}

export interface Carrera {
    idCarrera: number;
    nombreCarrera?: number;
    vigente?: boolean;
}

export interface Persona {
    idPersona: number;
    nombre?: string;
    rut?: string;
    vigente?: boolean;
}

export interface Usuarios {
    idUsuario: number;
    idPersona: number;
    rut?: string;
    nombre?: string;
    nombreRol?: string;
    vigente?: boolean;
}

export interface TableJuego {
    idJuego?: number;
    nombre?: string;
    semestre?: string;
    fechaInicio?: string;
    concluido?: string;
    actions?: DTButtonData[]|DTButtonData;
}

export interface Grupos {
    idGrupo: number;
    nombreGrupo?: string;
    dineroActual?: number;
    bloquesExtra?: number;
    idJuego?: number;
    vigente?: boolean;
}

export interface Ciudades {
    idCiudad: number;
    nombreCiudad?: number;
    horaAbre?: string;
    horaCierre?: string;
    vigente?: string;
}

export interface Productos {
    idProducto: number;
    nombre?: string;
    bloquesTotal?: number;
    vigente?: boolean;
}

export interface Historial {
    idHistorial: number;
    rut?: string;
    nombre?: string;
    nombreGrupo?: string;
    estado?: string;
}
