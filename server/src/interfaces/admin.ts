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
