import pgQuery from '../middleware/pgPromise'
import { Moment } from 'moment';

export interface TradeItems {
    idProducto: number,
    esCompra: boolean | string,
    cantidad: number
}

export default class GameModel {

    public static getAllGames () : Promise<any> {
        return pgQuery.any('\
            SELECT id_juego, nombre, semestre, concluido, fecha_inicio, fecha_termino FROM juego'
        );
    }

    public static getGameById (gameId:number) : Promise<any> {
        return pgQuery.one('\
            SELECT id_juego, nombre, semestre, concluido, fecha_inicio, fecha_termino \
            FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });
    }

    public static async getAllGameCities (gameId:number) : Promise<any> {
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        return pgQuery.any('\
            SELECT id_ciudad, nombre_ciudad, url_imagen, descripcion \
            FROM ciudad WHERE id_juego = $1',gameId
        );
    }

    public static async getGameCityById (gameId:number, cityId:number) : Promise<any> {
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        return pgQuery.one('\
            SELECT id_ciudad, nombre_ciudad, url_imagen, descripcion \
            FROM ciudad WHERE id_juego = $1 AND id_ciudad = $2',[gameId, cityId]
        ).catch(() => { throw new Error ('CITY_NOT_EXIST_IN_THIS_GAME') });
    }

    public static async getAllGameCityProducts (gameId:number, cityId:number) : Promise<any> {
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        await pgQuery.one('\
            SELECT * FROM ciudad WHERE id_juego = $1 AND id_ciudad = $2',
            [gameId, cityId]
        ).catch(() => { throw new Error ('CITY_NOT_EXIST_IN_THIS_GAME') });

        return pgQuery.any('\
            SELECT cp.id_ciudad, cp.id_producto, p.nombre AS nombre_producto, p.bloques_total, \
                cp.stock_actual, cp.stock_max, cp.precio_max, \
                cp.precio_min, cp.factor_compra, cp.factor_venta, cp.precio_compra, Cp.precio_venta  \
            FROM ciudad_producto cp INNER JOIN producto p ON p.id_producto = cp.id_producto \
            WHERE cp.id_ciudad = $1', cityId
        );
    }

    public static async getGameCityProductById (gameId:number, cityId:number, productId:number) : Promise<any>{
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        await pgQuery.one('\
            SELECT * FROM ciudad WHERE id_juego = $1 AND id_ciudad = $2',
            [gameId, cityId]
        ).catch(() => { throw new Error ('CITY_NOT_EXIST_IN_THIS_GAME') });

        await pgQuery.one('\
            SELECT * FROM producto WHERE id_juego = $1 AND id_producto = $2',
            [gameId, productId]
        ).catch(() => { throw new Error ('PRODUCT_NOT_EXIST_IN_THIS_GAME') });

        return pgQuery.one('\
            SELECT cp.id_ciudad, cp.id_producto, p.nombre AS nombre_producto, p.bloques_total, \
                cp.stock_actual, cp.stock_max, cp.precio_max, \
                cp.precio_min, cp.factor_compra, cp.factor_venta, cp.precio_compra, Cp.precio_venta  \
            FROM ciudad_producto cp INNER JOIN producto p ON p.id_producto = cp.id_producto \
            WHERE cp.id_ciudad = $1 AND cp.id_producto = $2', 
            [cityId, productId]
        ).catch(() => { throw new Error ('PRODUCT_NOT_IN_CITY') });
    }

    public static async getAllProducts (gameId:number) : Promise<any> {
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        return pgQuery.any('\
            SELECT id_producto, nombre, bloques_total, id_juego \
            FROM producto WHERE id_juego = $1', gameId
        );
    }

    public static async getProductById (gameId:number, productId:number) : Promise<any> {
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        return pgQuery.one('\
            SELECT id_producto, nombre, bloques_total, id_juego \
            FROM producto WHERE id_juego = $1 AND id_producto = $2',
            [gameId, productId]
        ).catch(() => { throw new Error ('PRODUCT_NOT_EXIST_IN_THIS_GAME') });
    }

    public static async getAllplayers (gameId:number) : Promise<any>{
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        return pgQuery.any('\
            SELECT id_jugador, id_alumno, id_juego, id_grupo, veces_designado \
            FROM jugador WHERE id_juego = $1', gameId
        );
    }

    public static async getPlayerById (gameId:number, playerId:number) : Promise<any> {
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        return pgQuery.one('\
            SELECT id_jugador, id_alumno, id_juego, id_grupo, veces_designado \
            FROM jugador WHERE id_jugador = $1 AND id_juego = $2',[playerId, gameId]
        ).catch(() => { throw new Error ('PLAYER_NOT_EXIST_IN_THIS_GAME') });
    }

    public static async getAllGroups (gameId:number) : Promise<any> {
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        return pgQuery.any('\
            SELECT id_grupo, nombre_grupo, dinero_actual, id_jugador_designado, bloques_extra, id_juego \
            FROM grupo WHERE id_juego = $1',gameId
        );
    }

    public static async getGroupById (gameId:number, groupId:number) : Promise<any> {
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        return pgQuery.one('\
            SELECT g.id_grupo, g.nombre_grupo, g.dinero_actual, g.id_jugador_designado, g.bloques_extra, g.id_juego, \
                t1.bloques_usados, (cj.max_bloques_bodega - t1.bloques_usados) AS bloques_disponibles \
            FROM grupo g RIGHT OUTER JOIN (\
                SELECT spg.id_grupo, SUM (spg.stock * p.bloques_total) AS bloques_usados \
                FROM stock_producto_grupo spg INNER JOIN producto p ON p.id_producto = spg.id_producto \
                GROUP BY spg.id_grupo \
            ) t1 ON t1.id_grupo = g.id_grupo \
                INNER JOIN config_juego cj ON cj.id_juego = g.id_juego \
            WHERE g.id_juego = $1 AND g.id_grupo = $2',[gameId, groupId]
        ).catch(() => { throw new Error ('GROUP_NOT_EXIST_IN_THIS_GAME') });
    }

    public static async getGroupCityTrades (gameId:number, groupId:number) : Promise<any>{
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        await pgQuery.one('SELECT * FROM grupo WHERE id_juego = $1 AND id_grupo = $2',
            [gameId, groupId]
        ).catch(() => { throw new Error ('GROUP_NOT_EXIST_IN_THIS_GAME') });

        return pgQuery.any('\
            SELECT i.id_intercambio, i.id_ciudad, i.id_grupo, i.fecha_intercambio, json_agg(tip) AS productos \
            FROM intercambio i INNER JOIN ( \
                SELECT ip.id_intercambio, p.id_producto, p.nombre AS nombre_producto, \
                    p.bloques_total, ip.es_compra, ip.cantidad, ip.precio_compra, ip.precio_venta \
                FROM producto p INNER JOIN intercambio_producto ip ON ip.id_producto = p.id_producto \
            ) tip ON tip.id_intercambio = i.id_intercambio \
            WHERE i.id_grupo = $1 GROUP BY i.id_intercambio',groupId
        );

    }

    public static async getGroupCityTradeById (gameId:number, groupId:number, tradeId:number) : Promise<any>{
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        await pgQuery.one('SELECT * FROM grupo WHERE id_juego = $1 AND id_grupo = $2',
            [gameId, groupId]
        ).catch(() => { throw new Error ('GROUP_NOT_EXIST_IN_THIS_GAME') });

        return pgQuery.one('\
            SELECT i.id_intercambio, i.id_ciudad, i.id_grupo, i.fecha_intercambio, json_agg(tip) AS productos \
            FROM intercambio i INNER JOIN ( \
                SELECT ip.id_intercambio, p.id_producto, p.nombre AS nombre_producto, \
                    p.bloques_total, ip.es_compra, ip.cantidad, ip.precio_compra, ip.precio_venta \
                FROM producto p INNER JOIN intercambio_producto ip ON ip.id_producto = p.id_producto \
            ) tip ON tip.id_intercambio = i.id_intercambio \
            WHERE i.id_grupo = $1 AND i.id_intercambio = $2 \
            GROUP BY i.id_intercambio',[groupId, tradeId]
        ).catch(() => { throw new Error ('TRADE_NOT_EXIST') });;
    }

    public static async doTrade (gameId:number, groupId:number, cityId:number, tradeDate:Moment, products: TradeItems[]) : Promise<any> {
        // Compruebo que el juego, grupo y ciudad sean válidos
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        await pgQuery.one('SELECT * FROM grupo WHERE id_juego = $1 AND id_grupo = $2',
            [gameId, groupId]
        ).catch(() => { throw new Error ('GROUP_NOT_EXIST_IN_THIS_GAME') });

        await pgQuery.one('SELECT * FROM ciudad WHERE id_juego = $1 AND id_ciudad = $2',
            [gameId, cityId]
        ).catch(() => { throw new Error ('CITY_NOT_EXIST_IN_THIS_GAME') });

        // Realizo la transacción
        return pgQuery.tx(async t => {
            // Creo el registro de la tabla intercambio
            const t1 = await t.one('\
                INSERT INTO intercambio (id_ciudad, id_grupo, fecha_intercambio) VALUES ($1,$2,$3) \
                RETURNING id_intercambio',[cityId, groupId, tradeDate.format()]
            );

            // Calculo los bloques y el dinero gastados/obtenidos por cada producto
            let dinero = 0;

            // Para cada producto
            products.forEach( async p => {
                // Compruebo si el producto está en la ciudad correspondiente
                const pData = await t.one('SELECT * FROM ciudad_producto WHERE id_ciudad = $1 AND id_producto = $2',
                    [cityId,p.idProducto]
                ).catch(() => { throw new Error ('CITY_HAS_NOT_PRODUCT')});

                // Agrego el producto al intercambio realizado
                await t.one('\
                    INSERT INTO intercambio_producto \
                        (id_intercambio, id_producto, es_compra, cantidad, precio_compra, precio_venta) \
                    VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_intercambio',
                    [t1.idIntercambio, p.idProducto, p.esCompra, p.cantidad, pData.precioCompra, pData.precioVenta]
                );

                // Agrego/Quito el producto al stock del grupo correspondiente
                await t.one('\
                    INSERT INTO stock_producto_grupo (id_grupo,id_producto,stock) VALUES ($1,$2,$3) \
                    ON CONFLICT (id_grupo,id_producto) DO \
                    UPDATE SET stock = (stock_producto_grupo.stock + $3) \
                        WHERE stock_producto_grupo.id_grupo = $1 AND stock_producto_grupo.id_producto = $2 \
                    RETURNING id_producto',
                    [groupId,p.idProducto,p.cantidad * (p.esCompra == "true" ? 1 : -1)]    
                )

                // Ajusto el stock de la ciudad dependiendo si es compra o venta del grupo
                dinero = dinero + p.cantidad * (p.esCompra == "true" ? -pData.precioCompra : pData.precioVenta);
                await t.one('\
                    UPDATE ciudad_producto SET stock_actual = stock_actual + $1 \
                    WHERE id_ciudad = $2 AND id_producto = $3 RETURNING id_ciudad',
                    [p.cantidad * (p.esCompra ? -1 : 1), cityId, p.idProducto]
                );

            });

            // Compruebo si el grupo tiene el dinero suficiente para hacer las compras
            await t.one('\
                SELECT * FROM grupo WHERE dinero_actual >= $1 AND id_grupo = $2',[dinero,groupId]
            ).catch(() => { throw new Error('GROUP_WITHOUT_ENOUGH_MONEY')});

            // Luego, compruebo si el grupo tiene los bloques suficientes para guardar los productos
            await t.one('\
                SELECT g.id_grupo, cj.max_bloques_bodega, SUM(spg.stock * p.bloques_total) AS bloques \
                FROM grupo g \
                    INNER JOIN config_juego cj ON g.id_juego = cj.id_juego \
                    INNER JOIN stock_producto_grupo spg ON spg.id_grupo = g.id_grupo \
                    INNER JOIN producto p ON p.id_producto = spg.id_producto \
                WHERE g.id_grupo = $1 \
                GROUP BY g.id_grupo, cj.max_bloques_bodega \
                HAVING ( cj.max_bloques_bodega + g.bloques_extra ) >= SUM(spg.stock * p.bloques_total)',
                groupId
            ).catch(() => { throw new Error('GROUP_WITHOUT_AVAILABLE_BLOCKS')});
            

            // Compruebo que la ciudad no tenga productos con stock negativo
            await t.none('SELECT * FROM ciudad_producto WHERE stock_actual < 0 AND id_ciudad = $1',cityId)
            .catch(() => { throw new Error('CITY_PRODUCT_STOCK_INVALID')});

            // Compruebo que el grupo no tenga productos con stock negativo
            await t.none('SELECT * FROM stock_producto_grupo WHERE stock < 0 AND id_grupo = $1',groupId)
            .catch(() => { throw new Error('GROUP_PRODUCT_STOCK_INVALID')});

            // actualizo el dinero del grupo
            await t.any('UPDATE grupo SET dinero_actual = dinero_actual + $1 WHERE id_grupo = $2', [dinero,cityId]);

            // Genero el nuevo factor de compra de los productos
            //    ESTO DEBE HACERSE AL CAMBIAR LAS VARIABLES DE LOS PRODUCTOS
            /*await t.any('\
                UPDATE ciudad_producto \
                SET factor_compra = TRUNC( (precio_min - precio_max) / stock_max,5) \
                WHERE id_ciudad = $1', cityId
            ); */

            // Genero el nuevo valor de compra para cada producto de la ciudad
            await t.any('\
                UPDATE ciudad_producto \
                SET precio_compra = TRUNC(\
                        CASE WHEN stock_actual > stock_max THEN precio_min \
                        ELSE factor_compra * stock_actual + precio_max END\
                    ,0) \
                WHERE id_ciudad = $1', cityId
            );

            // Genero el nuevo valor de venta para cada producto de la ciudad
            await t.any('\
                UPDATE ciudad_producto \
                SET precio_venta = TRUNC(factor_venta * precio_compra,0) \
                WHERE id_ciudad = $1', cityId
            );

        });

    }

}