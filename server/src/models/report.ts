import pgQuery from '../middleware/pgPromise'

export interface TeamGeneralData {
    idGrupo:number;
    nombreGrupo:string;
    dineroActual:number;
    bloquesExtra:number;
    idJugadorDesignado:number|null;
    idPersona:number|null;
    nombre:string|null;
    apellidoP:string|null;
    apellidoM:string|null;
    bloquesTotalCamion:number;
    bloquesTotalBodega:number;
    bloquesUsadosCamion:number;
    bloquesUsadosBodega:number;
    bloquesLibresCamion:number;
    bloquesLibresBodega:number;
}

export interface TeamStockData {
    idGrupo:number;
    nombreProducto:string;
    bloquesPorUnidad:number;
    stockCamion:number;
    stockBodega:number;
}

export interface TeamBuySellData {
    idIntercambio:number;
    fechaIntercambio:string;
    idCiudad:number;
    nombreCiudad:string;
    productos:{
        idProducto:number;
        nombreProducto:string;
        accion:string;
        precioUnitario:number;
        cantidad:number;
        montoTotal:number;
    }[];
}

export default class ReportModel {

    static async getGeneralTeamData(gameId:number,teamId:number) : Promise<TeamGeneralData> {
        return pgQuery.one<TeamGeneralData>('\
            SELECT g.id_grupo, g.nombre_grupo, g.dinero_actual, g.bloques_extra, \
                g.id_jugador_designado, p.id_persona, p.nombre, p.apellido_p, p.apellido_m, \
                cj.max_bloques_camion AS bloques_total_camion, (cj.max_bloques_bodega + g.bloques_extra) AS bloques_total_bodega, \
                CASE WHEN pr.id_grupo IS NULL THEN 0 ELSE pr.bloques_usados_camion END AS bloques_usados_camion, \
                CASE WHEN pr.id_grupo IS NULL THEN 0 ELSE pr.bloques_usados_bodega END AS bloques_usados_bodega, \
                (cj.max_bloques_camion - CASE WHEN pr.id_grupo IS NULL THEN 0 ELSE pr.bloques_usados_camion END) AS bloques_libres_camion, \
                (cj.max_bloques_bodega + g.bloques_extra - CASE WHEN pr.id_grupo IS NULL THEN 0 ELSE pr.bloques_usados_bodega END) AS bloques_libres_bodega \
            FROM grupo g \
                INNER JOIN config_juego cj ON cj.id_juego = g.id_juego \
                LEFT JOIN jugador j ON g.id_jugador_designado = j.id_jugador \
                LEFT JOIN persona p ON j.id_alumno = p.id_persona \
                LEFT JOIN ( \
                    SELECT spg.id_grupo, \
                        SUM(p.bloques_total * spg.stock_camion) AS bloques_usados_camion, \
                        SUM(p.bloques_total * spg.stock_bodega) AS bloques_usados_bodega \
                    FROM stock_producto_grupo spg \
                        INNER JOIN producto p ON p.id_producto = spg.id_producto \
                    GROUP BY spg.id_grupo \
                ) pr ON g.id_grupo = pr.id_grupo \
            WHERE g.id_juego = $1 AND g.id_grupo = $2',
            [gameId,teamId]
        );
    }

    static async getBuySellTeamData(gameId:number,teamId:number) : Promise<TeamBuySellData[]> {
        return pgQuery.any<TeamBuySellData>("\
            SELECT i.id_intercambio, i.fecha_intercambio, i.id_ciudad, c.nombre_ciudad, tr.productos \
            FROM grupo g  \
                INNER JOIN intercambio i ON i.id_grupo = g.id_grupo \
                INNER JOIN ciudad c ON c.id_ciudad = i.id_ciudad \
                INNER JOIN ( \
                    SELECT ip.id_intercambio, json_agg(json_build_object( \
                            'idProducto', p.id_producto, 'nombreProducto', p.nombre, \
                            'accion', CASE WHEN ip.es_compra = TRUE THEN 'COMPRA' ELSE 'VENTA' END, \
                            'precioUnitario', CASE WHEN ip.es_compra = TRUE THEN ip.precio_compra ELSE ip.precio_venta END, \
                            'cantidad', ip.cantidad, \
                            'montoTotal', ip.cantidad * CASE WHEN ip.es_compra = TRUE THEN ip.precio_compra ELSE ip.precio_venta END \
                        )) AS productos \
                    FROM intercambio_producto ip  \
                        INNER JOIN producto p ON p.id_producto = ip.id_producto \
                    GROUP BY ip.id_intercambio \
                ) tr ON tr.id_intercambio = i.id_intercambio \
            WHERE g.id_juego = $1 AND g.id_grupo = $2 \
            ORDER BY i.id_intercambio",
            [gameId,teamId]
        );
    }

    static async getStockTeamData (gameId:number,teamId:number) : Promise<TeamStockData[]>  {
        return pgQuery.any<TeamStockData>('\
            SELECT g.id_grupo, p.nombre AS nombre_producto, p.bloques_total AS bloques_por_unidad, \
                CASE WHEN spg.stock_camion IS NULL THEN 0 ELSE spg.stock_camion END AS stock_camion, \
                CASE WHEN spg.stock_bodega IS NULL THEN 0 ELSE spg.stock_bodega END AS stock_bodega \
            FROM grupo g  \
                CROSS JOIN producto p \
                LEFT JOIN stock_producto_grupo spg ON (p.id_producto = spg.id_producto AND g.id_grupo = spg.id_grupo) \
            WHERE g.id_juego = $1 AND g.id_grupo = $2 \
            ORDER BY nombre_producto',
            [gameId,teamId]
        );
    }

}