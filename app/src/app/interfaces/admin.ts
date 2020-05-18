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