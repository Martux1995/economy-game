export interface Grupo {
    idGrupo: number,
    nombreGrupo: string,
    dineroActual: number,
    idJugadorDesignado: number | null,
    bloquesUsados: number,
    bloquesDisponibles: number,
    bloquesExtra: number,
    idJuego: number
}