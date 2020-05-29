import pgQuery from '../middleware/pgPromise'
import { Moment } from 'moment';
import { GamePlayerCityProduct, TradeItems, ChangeItems, GamePlayerData, 
    GamePlayerCity, GamePlayerProduct, GamePlayerTruck, GamePlayerRentedBlocks } from '../interfaces/game';

export default class GameModel {

    /**
     * Retorna los datos necesarios para trabajar con el juego en el que participa un equipo
     * @param teamId El id del equipo correspondiente
     */
    static getGameDataByTeamId (teamId:number) : Promise<GamePlayerData>{
        return pgQuery.one('\
            SELECT j.id_juego, j.se_puede_comprar_bloques, j.precio_bloque_extra, \
                j.veces_compra_ciudad_dia \
            FROM config_juego j INNER JOIN grupo g ON g.id_juego = j.id_juego \
            WHERE g.id_grupo = $1',teamId
        );
    }

    static async getAllGameCities (gameId:number) : Promise<GamePlayerCity[]> {
        return pgQuery.any('\
            SELECT id_ciudad, nombre_ciudad AS nombre, url_imagen, descripcion, \
                hora_abre, hora_cierre \
            FROM ciudad WHERE id_juego = $1',gameId
        );
    }

    static async getGameCityById (gameId:number, cityId:number) : Promise<GamePlayerCity> {
        return pgQuery.one('\
            SELECT id_ciudad, nombre_ciudad AS nombre, url_imagen, descripcion, \
                hora_abre, hora_cierre \
            FROM ciudad WHERE id_juego = $1 AND id_ciudad = $2',[gameId, cityId]
        ).catch(() => { throw new Error ('CITY_NOT_EXIST') });
    }

    static async getAllGameCityProducts (gameId:number, teamId:number, cityId:number) : Promise<GamePlayerCityProduct[]> {
        await pgQuery.one('\
            SELECT * FROM ciudad WHERE id_juego = $1 AND id_ciudad = $2',[gameId, cityId]
        ).catch(() => { throw new Error ('CITY_NOT_EXIST') });

        await pgQuery.one('\
            SELECT * FROM ciudad c \
            WHERE c.hora_abre::time <= NOW()::time AND NOW()::time <= c.hora_cierre::time \
                AND c.id_ciudad = $1',cityId
        ).catch(() => { throw new Error('CITY_CLOSED') });

        await pgQuery.none('\
            SELECT c.veces \
            FROM ( \
                SELECT g.id_grupo, c.id_ciudad, SUM(CASE WHEN NOW()::date = fecha_intercambio::date THEN 1 ELSE 0 END) AS veces \
                FROM grupo g CROSS JOIN ciudad c  \
                    LEFT OUTER JOIN intercambio i ON c.id_ciudad = i.id_ciudad AND g.id_grupo = i.id_grupo \
                GROUP BY g.id_grupo, c.id_ciudad \
            ) AS c  \
                INNER JOIN grupo g ON c.id_grupo = g.id_grupo \
                INNER JOIN config_juego j ON j.id_juego = g.id_juego \
            WHERE c.id_grupo = $1 AND c.id_ciudad = $2 AND c.veces >= j.veces_compra_ciudad_dia',
            [teamId,cityId]
        ).catch(() => { throw new Error('MAX_TRADE_CITY_REACHED')});

        return pgQuery.any('\
            SELECT cp.id_producto, p.nombre, p.bloques_total AS bloques, \
                cp.stock_actual AS stock, cp.precio_compra, cp.precio_venta  \
            FROM ciudad_producto cp INNER JOIN producto p ON p.id_producto = cp.id_producto \
            WHERE cp.id_ciudad = $1', cityId
        );
    }

    static async getGameCityProductById (gameId:number, teamId:number, cityId:number, productId:number, ignoreValidation:boolean = false) : Promise<GamePlayerCityProduct>{
        if (!ignoreValidation) {
            await pgQuery.one('\
                SELECT * FROM ciudad WHERE id_juego = $1 AND id_ciudad = $2',[gameId, cityId]
            ).catch(() => { throw new Error ('CITY_NOT_EXIST') });

            await pgQuery.one('\
                SELECT * FROM producto WHERE id_juego = $1 AND id_producto = $2',[gameId, productId]
            ).catch(() => { throw new Error ('PRODUCT_NOT_EXIST') });

            await pgQuery.one('\
                SELECT * FROM ciudad c \
                WHERE c.hora_abre::time <= NOW()::time AND NOW()::time <= c.hora_cierre::time \
                    AND c.id_ciudad = $1',cityId
            ).catch(() => { throw new Error('CITY_CLOSED') });

            await pgQuery.none('\
                SELECT c.veces \
                FROM ( \
                    SELECT g.id_grupo, c.id_ciudad, SUM(CASE WHEN NOW()::date = fecha_intercambio::date THEN 1 ELSE 0 END) AS veces \
                    FROM grupo g CROSS JOIN ciudad c  \
                        LEFT OUTER JOIN intercambio i ON c.id_ciudad = i.id_ciudad AND g.id_grupo = i.id_grupo \
                    GROUP BY g.id_grupo, c.id_ciudad \
                ) AS c  \
                    INNER JOIN grupo g ON c.id_grupo = g.id_grupo \
                    INNER JOIN config_juego j ON j.id_juego = g.id_juego \
                WHERE c.id_grupo = $1 AND c.id_ciudad = $2 AND c.veces >= j.veces_compra_ciudad_dia',
                [teamId,cityId]
            ).catch(() => { throw new Error('MAX_TRADE_CITY_REACHED')})
        }

        return pgQuery.one('\
            SELECT cp.id_producto, p.nombre, p.bloques_total AS bloques, \
                cp.stock_actual AS stock, cp.precio_compra, cp.precio_venta  \
            FROM ciudad_producto cp INNER JOIN producto p ON p.id_producto = cp.id_producto \
            WHERE cp.id_ciudad = $1 AND cp.id_producto = $2', 
            [cityId, productId]
        ).catch(() => { throw new Error ('PRODUCT_NOT_IN_CITY') });
    }

    static async getAllProducts (gameId:number) : Promise<GamePlayerProduct[]> {
        return pgQuery.any('\
            SELECT id_producto, nombre, bloques_total AS bloques \
            FROM producto WHERE id_juego = $1', gameId
        );
    }

    static async getProductById (gameId:number, productId:number) : Promise<GamePlayerProduct> {
        return pgQuery.one('\
            SELECT id_producto, nombre, bloques_total AS bloques \
            FROM producto WHERE id_juego = $1 AND id_producto = $2',
            [gameId, productId]
        ).catch(() => { throw new Error ('PRODUCT_NOT_EXIST') });
    }
/*
    static async getAllplayers (gameId:number) : Promise<any>{
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        return pgQuery.any('\
            SELECT id_jugador, id_alumno, id_juego, id_grupo, veces_designado \
            FROM jugador WHERE id_juego = $1', gameId
        );
    }

    static async getPlayerById (gameId:number, playerId:number) : Promise<any> {
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        return pgQuery.one('\
            SELECT id_jugador, id_alumno, id_juego, id_grupo, veces_designado \
            FROM jugador WHERE id_jugador = $1 AND id_juego = $2',[playerId, gameId]
        ).catch(() => { throw new Error ('PLAYER_NOT_EXIST_IN_THIS_GAME') });
    }
*/ /*
    static async getAllGroups (gameId:number) : Promise<any> {
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        return pgQuery.any('\
            SELECT id_grupo, nombre_grupo, dinero_actual, id_jugador_designado, bloques_extra, id_juego \
            FROM grupo WHERE id_juego = $1',gameId
        );
    }

    static async getGroupById (gameId:number, teamId:number) : Promise<any> {
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
            WHERE g.id_juego = $1 AND g.id_grupo = $2',[gameId, teamId]
        ).catch(() => { throw new Error ('GROUP_NOT_EXIST_IN_THIS_GAME') });
    }
*/ /*
    static async getGroupCityTrades (gameId:number, teamId:number) : Promise<any>{
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        await pgQuery.one('SELECT * FROM grupo WHERE id_juego = $1 AND id_grupo = $2',
            [gameId, teamId]
        ).catch(() => { throw new Error ('GROUP_NOT_EXIST_IN_THIS_GAME') });

        return pgQuery.any('\
            SELECT i.id_intercambio, i.id_ciudad, i.id_grupo, i.fecha_intercambio, json_agg(tip) AS productos \
            FROM intercambio i INNER JOIN ( \
                SELECT ip.id_intercambio, p.id_producto, p.nombre AS nombre_producto, \
                    p.bloques_total, ip.es_compra, ip.cantidad, ip.precio_compra, ip.precio_venta \
                FROM producto p INNER JOIN intercambio_producto ip ON ip.id_producto = p.id_producto \
            ) tip ON tip.id_intercambio = i.id_intercambio \
            WHERE i.id_grupo = $1 GROUP BY i.id_intercambio',teamId
        );

    }

    static async getGroupCityTradeById (gameId:number, teamId:number, tradeId:number) : Promise<any>{
        await pgQuery.one('SELECT * FROM juego WHERE id_juego = $1',gameId)
        .catch(() => { throw new Error ('GAME_NOT_EXIST') });

        await pgQuery.one('SELECT * FROM grupo WHERE id_juego = $1 AND id_grupo = $2',
            [gameId, teamId]
        ).catch(() => { throw new Error ('GROUP_NOT_EXIST_IN_THIS_GAME') });

        return pgQuery.one('\
            SELECT i.id_intercambio, i.id_ciudad, i.id_grupo, i.fecha_intercambio, json_agg(tip) AS productos \
            FROM intercambio i INNER JOIN ( \
                SELECT ip.id_intercambio, p.id_producto, p.nombre AS nombre_producto, \
                    p.bloques_total, ip.es_compra, ip.cantidad, ip.precio_compra, ip.precio_venta \
                FROM producto p INNER JOIN intercambio_producto ip ON ip.id_producto = p.id_producto \
            ) tip ON tip.id_intercambio = i.id_intercambio \
            WHERE i.id_grupo = $1 AND i.id_intercambio = $2 \
            GROUP BY i.id_intercambio',[teamId, tradeId]
        ).catch(() => { throw new Error ('TRADE_NOT_EXIST') });;
    }
*/

    static checkProduct(cityId: number, productId: number) : Promise<{idProducto:number}>{
        return pgQuery.one('\
            SELECT id_producto FROM ciudad_producto \
            WHERE id_ciudad = $1 AND id_producto = $2',
            [cityId,productId]
        ).catch(() => null);
    }

    static doTrade (gameId:number, teamId:number, cityId:number, tradeDate:Moment, products: TradeItems[]) : Promise<boolean> {
        return pgQuery.tx(async t => {

            // Comprobar que la ciudad exista
            await pgQuery.one('SELECT * FROM ciudad WHERE id_juego = $1 AND id_ciudad = $2',
                [gameId, cityId]
            ).catch(() => { throw new Error ('CITY_NOT_EXIST') });

            // Comprobar que la ciudad no se encuentre cerrada
            await pgQuery.one('\
                SELECT * FROM ciudad c \
                WHERE c.hora_abre::time <= NOW()::time AND NOW()::time <= c.hora_cierre::time \
                    AND c.id_ciudad = $1',cityId
            ).catch(() => { throw new Error('CITY_CLOSED') });

            // Comprobar que en la ciudad se puedan realizar compras (que no haya alcanzado el límite)
            await pgQuery.none('\
                SELECT c.veces \
                FROM ( \
                    SELECT g.id_grupo, c.id_ciudad, SUM(CASE WHEN NOW()::date = fecha_intercambio::date THEN 1 ELSE 0 END) AS veces \
                    FROM grupo g CROSS JOIN ciudad c  \
                        LEFT OUTER JOIN intercambio i ON c.id_ciudad = i.id_ciudad AND g.id_grupo = i.id_grupo \
                    GROUP BY g.id_grupo, c.id_ciudad \
                ) AS c  \
                    INNER JOIN grupo g ON c.id_grupo = g.id_grupo \
                    INNER JOIN config_juego j ON j.id_juego = g.id_juego \
                WHERE c.id_grupo = $1 AND c.id_ciudad = $2 AND c.veces >= j.veces_compra_ciudad_dia',
                [teamId,cityId]
            ).catch(() => { throw new Error('MAX_TRADE_CITY_REACHED')});

            // Crear el registro en la tabla intercambio para obtener el id
            const t1 = await t.one('\
                INSERT INTO intercambio (id_ciudad, id_grupo, fecha_intercambio) VALUES ($1,$2,$3) \
                RETURNING id_intercambio',[cityId, teamId, tradeDate.format()]
            );

            // Se crea la variable dinero para saber cuanto se gasta u obtiene
            let dinero = 0;

            // Para cada producto
            for (let i = 0; i < products.length; i++) {
                const p = products[i];
                
                // Obtener todos los datos del producto para la ciudad
                const pData = await t.one('SELECT * FROM ciudad_producto WHERE id_ciudad = $1 AND id_producto = $2',
                    [cityId,p.idProducto]
                );

                // Calcular los movimientos de dinero para cada producto que se compra o vende
                if (p.esCompra) dinero -= pData.precioCompra * p.cantidad;
                else            dinero += pData.precioVenta * p.cantidad;

                // Agregar el producto al listado del intercambio
                await t.one('\
                    INSERT INTO intercambio_producto \
                        (id_intercambio, id_producto, es_compra, cantidad, precio_compra, precio_venta) \
                    VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_intercambio',
                    [t1.idIntercambio, p.idProducto, p.esCompra, p.cantidad, pData.precioCompra, pData.precioVenta]
                );

                // Aumentar o reducir el stock del producto al grupo solicitante
                await t.one('\
                    INSERT INTO stock_producto_grupo (id_grupo,id_producto,stock_camion) VALUES ($1,$2,$3) \
                    ON CONFLICT (id_grupo,id_producto) DO \
                    UPDATE SET stock_camion = (stock_producto_grupo.stock_camion + $3) \
                        WHERE stock_producto_grupo.id_grupo = $1 AND stock_producto_grupo.id_producto = $2 \
                    RETURNING id_producto',
                    [teamId,p.idProducto,p.cantidad * (p.esCompra ? 1 : -1)]    
                )

                // Ajustar el stock de la ciudad segun si es compra o venta.
                await t.one('\
                    UPDATE ciudad_producto SET stock_actual = stock_actual + $1 \
                    WHERE id_ciudad = $2 AND id_producto = $3 RETURNING id_ciudad',
                    [p.cantidad * (p.esCompra ? -1 : 1), cityId, p.idProducto]
                );
            }
                
            // Compruebo que la ciudad haya quedado con stock de productos positivo (>= 0)
            await t.none('SELECT * FROM ciudad_producto WHERE stock_actual < 0 AND id_ciudad = $1',cityId)
            .catch(() => { throw new Error('NOT_ENOUGH_CITY_STOCK')});

            // Compruebo que el grupo haya quedado con stock de productos positivo (>= 0)
            await t.none('SELECT * FROM stock_producto_grupo WHERE stock_camion < 0 AND id_grupo = $1',teamId)
            .catch(() => { throw new Error('NOT_ENOUGH_GROUP_STOCK')});

            // Actualizo el dinero del grupo. En caso de no existir dinero suficiente, se lanza error
            await t.one('\
                UPDATE grupo SET dinero_actual = dinero_actual + $1 \
                WHERE id_grupo = $2 AND dinero_actual + $1 >= 0 \
                RETURNING id_grupo', [dinero,teamId]
            ).catch(() => { throw new Error('NO_ENOUGH_MONEY')});

            // Luego, compruebo si el grupo tiene los bloques suficientes para guardar los productos en el camion
            await t.one('\
                SELECT g.id_grupo, cj.max_bloques_camion, SUM(spg.stock_camion * p.bloques_total) AS bloques \
                FROM grupo g \
                    INNER JOIN config_juego cj ON g.id_juego = cj.id_juego \
                    INNER JOIN stock_producto_grupo spg ON spg.id_grupo = g.id_grupo \
                    INNER JOIN producto p ON p.id_producto = spg.id_producto \
                WHERE g.id_grupo = $1 \
                GROUP BY g.id_grupo, cj.max_bloques_camion \
                HAVING cj.max_bloques_camion >= SUM(spg.stock_camion * p.bloques_total)',
                teamId
            ).catch(() => { throw new Error('NO_TRUCK_AVAILABLE_BLOCKS')});

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

            return true;

        }).catch((err) => { throw err });

    }

    static getTruckInfo (gameId:number, teamId:number) : Promise<GamePlayerTruck>{
        return pgQuery.one('\
            SELECT SUM(spg.stock_camion * p.bloques_total) AS bloques_en_uso \
            FROM stock_producto_grupo spg INNER JOIN producto p ON spg.id_producto = p.id_producto \
            WHERE id_grupo = $1',teamId
        )
    }

    static changeProductStorage (gameId:number, teamId:number, products:ChangeItems[]) : Promise<boolean> {
        return pgQuery.tx( async t => {
            for (const p of products) {
                // Hacer los cambios para cada producto
                await t.one('\
                    UPDATE stock_producto_grupo \
                    SET stock_camion = stock_camion + $3, stock_bodega = stock_bodega + $4 \
                    WHERE id_grupo = $1 AND id_producto = $2 RETURNING id_producto',
                    [teamId,p.idProducto,p.cantidad * (p.cargando?1:-1),p.cantidad * (p.cargando?-1:1)]
                );
            }

            const gameData = await t.one('\
                SELECT max_bloques_camion, max_bloques_bodega FROM config_juego \
                WHERE id_juego = $1',gameId
            );

            const groupData = await t.one('SELECT bloques_extra FROM grupo WHERE id_grupo = $1',teamId);

            // Verificar si cada producto no generó deficit en los almacenes
            await t.none('\
                SELECT * FROM stock_producto_grupo \
                WHERE (stock_camion < 0 OR stock_bodega < 0) AND id_grupo = $1',
                [teamId]
            ).catch(() => { throw new Error('NOT_ENOUGH_GROUP_STOCK') });

            // Verificar si los productos no exceden el tamaño de bloques de los almacenes
            await t.none('\
                SELECT SUM(spg.stock_camion * p.bloques_total) \
                FROM stock_producto_grupo spg INNER JOIN producto p ON p.id_producto = spg.id_producto \
                WHERE id_grupo = $1 \
                HAVING SUM(spg.stock_camion * p.bloques_total) > $2',
                [teamId,gameData.maxBloquesCamion]
            ).catch(() => { throw new Error('NO_TRUCK_AVAILABLE_BLOCKS') });

            await t.none('\
                SELECT SUM(spg.stock_bodega * p.bloques_total) \
                FROM stock_producto_grupo spg INNER JOIN producto p ON p.id_producto = spg.id_producto \
                WHERE id_grupo = $1 \
                HAVING SUM(spg.stock_bodega * p.bloques_total) > ($2 + $3)',
                [teamId,groupData.bloquesExtra,gameData.maxBloquesBodega]
            ).catch(() => { throw new Error('NO_WAREHOUSE_AVAILABLE_BLOCKS') });

            return true;
        }).catch((err) => { throw err });
    }

    static getGroupRentedBlocks (teamId:number) : Promise<GamePlayerRentedBlocks> {
        return pgQuery.one('\
            SELECT g.bloques_extra, j.se_puede_comprar_bloques AS arriendo_bloques_extra, \
                j.prox_cobro_bloque_extra AS fecha_cobro, j.precio_bloque_extra \
            FROM grupo g INNER JOIN config_juego j ON j.id_juego = g.id_juego\
            WHERE g.id_grupo = $1',teamId
        );
    }

    static rentNewBlocks (teamId:number,cant:number) : Promise<boolean> {
        return pgQuery.tx(async t => {
            const data = await t.one('\
                SELECT j.se_puede_comprar_bloques AS arriendo_bloques_extra, j.precio_bloque_extra \
                FROM grupo g INNER JOIN config_juego j ON j.id_juego = g.id_juego\
                WHERE g.id_grupo = $1',teamId
            );

            if (!data.arriendoBloquesExtra) throw new Error('CANNOT_RENT_BLOCKS');

            await t.one('\
                UPDATE grupo \
                SET dinero_actual = dinero_actual - $1, bloques_extra = bloques_extra + $2 \
                WHERE id_grupo = $3 RETURNING id_grupo',[data.precioBloqueExtra * cant,cant,teamId]
            );

            await t.one('SELECT * FROM grupo WHERE id_grupo = $1 AND dinero_actual > 0',teamId)
            .catch(() => { throw new Error('NO_ENOUGH_MONEY') });

            return true;
        }).catch((err) => { throw err });
    }

    static subletBlocks (teamId:number, cant:number) : Promise<boolean> {
        return pgQuery.tx(async t => {
            const data = await t.one('\
                SELECT j.max_bloques_bodega, g.bloques_extra \
                FROM grupo g INNER JOIN config_juego j ON j.id_juego = g.id_juego\
                WHERE g.id_grupo = $1',teamId
            );

            if (data.bloquesExtra < cant)   throw new Error('RENTED_BLOCKS_EXCEDED');

            await t.one('\
                UPDATE grupo \
                SET bloques_extra = bloques_extra - $1 \
                WHERE id_grupo = $2 AND (bloques_extra + $3 - $1) > ( \
                    SELECT DISTINCT SUM(spg.stock_bodega * p.bloques_total) \
                    FROM stock_producto_grupo spg INNER JOIN producto p ON p.id_producto = spg.id_producto \
                    WHERE spg.id_grupo = $2 \
                ) \
                RETURNING id_grupo',[cant,teamId,data.maxBloquesBodega]
            ).catch((err) => { throw new Error('RENTED_BLOCKS_IN_USE') });

            return true;
        }).catch((err) => { throw err });
    }

}