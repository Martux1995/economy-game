export interface Ciudad {
    idCiudad: number,
    nombre: string,
    urlImagen: string,
    descripcion: string,
    horaAbre: string,
    horaCierre: string
}

export interface ProductoCiudad {
    idProducto: number,
    nombre: string,
    bloques: number,
    stock: number,
    precioCompra: number,
    precioVenta: number
}

export interface IntercambioProducto {
    idProducto: number,
    esCompra: string | boolean,
    cantidad: number
}