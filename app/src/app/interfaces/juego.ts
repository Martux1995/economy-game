import { InputData } from '../components/datatable/datatable.component';

export interface Producto {
    idProducto: number;
    nombre: string;
    bloques: number;
}

export interface Ciudad {
    idCiudad: number;
    nombre: string;
    urlImagen: string;
    descripcion: string;
    horaAbre: string;
    horaCierre: string;
}

export interface CiudadProducto {
    idProducto: number;
    nombre: string;
    bloques: number;
    stock: number;
    precioCompra: number;
    precioVenta: number;
}

export interface IntercambioProducto {
    idProducto: number;
    esCompra: string | boolean;
    cantidad: number;
}

export interface BloquesArrendados {
    bloquesExtra: number;
    arriendoBloquesExtra: boolean;
    fechaCobro: string;
    precioBloqueExtra: number;
}

// DATATABLES
export interface DataTableCiudadProducto {
    id: number;
    nombre: string;
    bloques: number;
    stock: number;
    precioCompra: string;
    precioVenta: string;
    esCompra: boolean;
    amount: InputData;
}