export interface Ciudad {
    idCiudad: number,
    nombreCiudad: string,
    nombreImagen: string,
    comercioAbierto: boolean
}

export interface ProductoCiudad {
    idCiudad: number,
    idProducto: number,
    nombreProducto: string,
    bloquesTotal: number,
    stockActual: number,
    stockMax: number,
    precioMax: number,
    precioMin: number,
    factorCompra: number,
    factorVenta: number,
    precioCompra: number,
    precioVenta: number
}

export interface IntercambioProducto {
    idProducto: number,
    esCompra: string | boolean,
    cantidad: number
}