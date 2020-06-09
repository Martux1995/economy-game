import pgQuery from '../middleware/pgPromise';
import { Jugador, Grupo, Juego, Reporte, ReporteStock, ReportExcelData, Persona, Ciudad, Producto } from '../interfaces/admin';

export default class AdminGameModel {

    static getGroupByName (gameId:number,name:string) : Promise<Grupo> {
        return pgQuery.one<Grupo>('\
            SELECT * FROM juego WHERE id_juego = $1 AND nombre_grupo = $2',
            [gameId,name]
        );
    }

    
    static getPlayerByRut (gameId:number,rut:string) : Promise<Jugador> {
        return pgQuery.one<Jugador>('\
            SELECT * \
            FROM jugador j \
                INNER JOIN grupo g ON j.id_grupo = g.id_grupo \
                INNER JOIN alumno a ON j.id_alumno = a.id_alumno \
                INNER JOIN persona p ON a.id_alumno = p.id_persona \
            WHERE p.rut = $1 AND g.id_juego = $2',[rut,gameId]
        );
    }

    static getPlayerById (gameId:number,playerId:number) : Promise<Jugador>;
    static getPlayerById (gameId:number,playerId:number[]) : Promise<Jugador[]>;
    static getPlayerById (gameId:number,playerId:any) : Promise<Jugador|Jugador[]> {
        if (playerId instanceof Array) {
            return pgQuery.any<Jugador>('\
                SELECT * \
                FROM jugador j \
                    INNER JOIN grupo g ON j.id_grupo = g.id_grupo \
                    INNER JOIN alumno a ON j.id_alumno = a.id_alumno \
                    INNER JOIN persona p ON a.id_alumno = p.id_persona \
                WHERE g.id_juego = $1 AND j.id_jugador IN ($2:list)',
                [gameId, playerId]
            );
        } else {
            return pgQuery.one<Jugador>('\
                SELECT * \
                FROM jugador j \
                    INNER JOIN grupo g ON j.id_grupo = g.id_grupo \
                    INNER JOIN alumno a ON j.id_alumno = a.id_alumno \
                    INNER JOIN persona p ON a.id_alumno = p.id_persona \
                WHERE j.id_jugador = $1 AND g.id_juego = $2',[playerId,gameId]
            );
        }
    }

    // static addNewGroups (gameId:number,gData:GroupData | GroupData[]) : Promise<boolean> {
    //     return pgQuery.tx(async t => {
    //         let juego = await this.getGameById(gameId).catch((err) => {throw Error('GAME_NOT_EXISTS')});

    //         if (gData instanceof Array) {
    //             for (const g of gData) {

    //                 let groupId = await t.one('\
    //                     INSERT INTO grupo (nombreGrupo,dineroActual,bloquesExtra,idJugadorDesignado,idJuego)\
    //                     VALUES ($1,$2,$3,$4,$5) RETURNING id_grupo',[g.nombreGrupo,juego.dineroInicial,0,null,gameId]
    //                 );
                    

    //                 for (const rut of g.ruts!) {
                        
    //                 }
                    
    //             }
    //         }

    //         return true;
    //     });
    // }

    static getAllGames () {
        return pgQuery.any("SELECT id_juego, nombre, semestre, concluido, to_char(fecha_inicio, 'DD/MM/YYYY') AS fecha_inicio FROM juego ORDER BY nombre");
    }

    static getValidGames() : Promise<Juego[]> {
        return pgQuery.any<Juego>('\
            SELECT * FROM juego j INNER JOIN config_juego cj ON cj.id_juego = j.id_juego \
            WHERE concluido = FALSE'
        );
    }
    
    static getGameById (gameId:number) : Promise<Juego>{
        return pgQuery.one<Juego>('\
            SELECT * FROM juego j INNER JOIN config_juego cj ON cj.id_juego = j.id_juego \
            WHERE j.id_juego = $1',gameId
        );
    };

    static getDataGameById (id:number){
        return pgQuery.one("\
            SELECT *, to_char(fecha_inicio, 'DD/MM/YYYY') AS fecha_inicio_format, \
                to_char(fecha_termino, 'DD/MM/YYYY') AS fecha_termino_format, \
                to_char(prox_cobro_bloque_extra, 'DD/MM/YYYY') AS prox_cobro_bloque_extra_format, \
                to_char(prox_cobro_impuesto, 'DD/MM/YYYY') AS prox_cobro_impuesto_format, \
                to_char(prox_rotacion_lideres, 'DD/MM/YYYY') AS prox_rotacion_lideres_format \
            FROM juego \
                INNER JOIN config_juego ON juego.id_juego = config_juego.id_juego \
            WHERE juego.id_juego = $1",id)
            .catch(() => { throw new Error ('GAME_GET_ERROR') });
    }

    static getPlayersByGameId (id:number){
        return pgQuery.any("\
            SELECT CONCAT(p.nombre, ' ', p.apellido_p, ' ', p.apellido_m) AS nombre, p. rut, j.id_alumno, j.id_jugador, j.id_grupo, g.nombre_grupo \
            FROM persona p \
                INNER JOIN jugador j ON p.id_persona = j.id_alumno \
                INNER JOIN grupo g ON j.id_grupo = g.id_grupo \
            WHERE j.id_juego = $1",id)
        .catch(() => { throw new Error ('PLAYERS_GET_ERROR') });
    }

    static getTeachersByGameId(gameId:number) : Promise<Persona[]> {
        return pgQuery.any<Persona>('\
            SELECT * \
            FROM ciudad c INNER JOIN profesor pr ON c.id_profesor = pr.id_profesor \
                INNER JOIN persona p ON p.id_persona = pr.id_profesor \
            WHERE c.id_juego = $1 AND c.vigente = TRUE AND pr.vigente = TRUE',
            gameId
        )
    }

    static getCitiesByGameId(gameId:number) : Promise<Ciudad[]>{
        return pgQuery.any<Ciudad>('SELECT * FROM ciudad c WHERE id_juego = $1',gameId);
    }

    static geValidCitiesByGameId(gameId:number) : Promise<Ciudad[]>{
        return pgQuery.any<Ciudad>('SELECT * FROM ciudad c WHERE vigente = TRUE AND id_juego = $1',gameId);
    }

    static getValidProductsByGameId(gameId:number) : Promise<Producto[]>{
        return pgQuery.any<Producto>('SELECT * FROM producto p WHERE vigente = TRUE AND id_juego = $1',gameId);
    }
    
    static getProductsByGameId(gameId:number) : Promise<Producto[]>{
        return pgQuery.any<Producto>('SELECT * FROM producto p WHERE id_juego = $1',gameId);
    }

    static chargeExtraBlocksCost (game:Juego) : Promise<boolean> {
        return pgQuery.tx(async t => {
            await t.any('\
                UPDATE grupo SET dinero_actual = dinero_actual - ($1 * bloques_extra) \
                WHERE id_juego = $2 AND vigente = TRUE',[game.precioBloqueExtra,game.idJuego]
            );
            await t.one("\
                UPDATE config_juego \
                SET prox_cobro_bloque_extra = prox_cobro_bloque_extra + (freq_cobro_bloque_extra_dias || ' DAYS')::INTERVAL \
                WHERE id_juego = $1 RETURNING id_juego",game.idJuego
            );
            return true;
        });
    }

    static chargeTaxCost (game:Juego) : Promise<boolean> {
        return pgQuery.tx(async t => {
            await t.any('\
                UPDATE grupo SET dinero_actual = dinero_actual - $1 \
                WHERE id_juego = $2 AND vigente = TRUE',[game.valorImpuesto,game.idJuego]
            );
            await t.one("\
                UPDATE config_juego \
                SET prox_cobro_impuesto = prox_cobro_impuesto + (freq_cobro_impuesto_dias || ' DAYS')::INTERVAL \
                WHERE id_juego = $1 RETURNING id_juego",game.idJuego
            );
            return true;
        });
    }

    static updateLeaderTeam (gameId:number) : Promise<Jugador[]>{
        return pgQuery.tx(async t => {
            let groups = await t.any<{idGrupo:number, posiblesLideres:number[]}>('\
                SELECT j.id_grupo, array_agg(j.id_jugador) AS posibles_lideres \
                FROM ( \
                    SELECT g.id_grupo, MAX(j.veces_designado) AS maximo, MIN(j.veces_designado) AS minimo \
                    FROM jugador j INNER JOIN grupo g ON j.id_grupo = g.id_grupo  \
                    WHERE g.vigente = TRUE AND j.vigente = TRUE AND j.id_juego = $1 \
                    GROUP BY g.id_grupo \
                ) AS jv INNER JOIN jugador j ON j.id_grupo = jv.id_grupo \
                WHERE jv.minimo = j.veces_designado AND j.vigente = TRUE \
                GROUP BY j.id_grupo',gameId
            );

            let leadersId:number[] = [];

            for (const g of groups) {                 
                let newLeader = g.posiblesLideres[Math.floor(Math.random() * g.posiblesLideres.length)];
                await t.one('UPDATE grupo SET id_jugador_designado = $1 WHERE id_grupo = $2 RETURNING id_grupo',[newLeader,g.idGrupo]);
                leadersId.push(newLeader);
            }

            await t.any('\
                UPDATE jugador SET veces_designado = veces_designado + 1 \
                WHERE id_jugador IN (SELECT DISTINCT id_jugador_designado FROM grupo) \
                RETURNING id_jugador'
            );

            await t.one("\
                UPDATE config_juego \
                SET prox_rotacion_lideres = prox_rotacion_lideres + (freq_rotacion_lideres_dias || ' DAYS')::INTERVAL \
                WHERE id_juego = $1 RETURNING id_juego",gameId
            );

            return await this.getPlayerById(gameId,leadersId);
        });
    }

    static generateReportData (gameId:number) : Promise<boolean> {
        return pgQuery.tx( async t => {
            let c = await t.one<{count:number}>('SELECT MAX(id_reporte) AS count FROM reporte');
            await t.any<Reporte>("\
                INSERT INTO reporte (id_grupo,fecha_inicio,fecha_fin,saldo_final,ingreso,egreso,utilidad) \
                    SELECT g.id_grupo, \
                        CASE WHEN cj.prox_generacion_reporte - (cj.freq_generacion_reporte_dias || ' DAYS')::INTERVAL > j.fecha_inicio \
                            THEN cj.prox_generacion_reporte - (cj.freq_generacion_reporte_dias || ' DAYS')::INTERVAL \
                            ELSE j.fecha_inicio \
                        END AS fecha_inicio, \
                        cj.prox_generacion_reporte AS fecha_fin, \
                        g.dinero_actual AS saldo_final, \
                        SUM(CASE WHEN ip.es_compra IS NULL OR ip.es_compra THEN 0 ELSE ip.precio_venta * ip.cantidad END) AS ingreso, \
                        SUM(CASE WHEN ip.es_compra IS NULL OR ip.es_compra = FALSE THEN 0 ELSE ip.precio_compra * ip.cantidad END) AS egreso, \
                        SUM(CASE WHEN ip.es_compra IS NULL OR ip.es_compra THEN 0 ELSE ip.precio_venta * ip.cantidad END) \
                            - SUM(CASE WHEN ip.es_compra IS NULL OR ip.es_compra = FALSE THEN 0 ELSE ip.precio_compra * ip.cantidad END) AS utilidad \
                    FROM grupo g \
                        INNER JOIN juego j ON g.id_juego = j.id_juego \
                        INNER JOIN config_juego cj ON j.id_juego = cj.id_juego \
                        LEFT JOIN intercambio i ON g.id_grupo = i.id_grupo \
                        LEFT JOIN intercambio_producto ip ON i.id_intercambio = ip.id_intercambio \
                    WHERE g.id_juego = $1 \
                        AND (i.fecha_intercambio IS NULL OR i.fecha_intercambio > CASE \
                            WHEN cj.prox_generacion_reporte - (cj.freq_generacion_reporte_dias || ' DAYS')::INTERVAL > j.fecha_inicio \
                                THEN cj.prox_generacion_reporte - (cj.freq_generacion_reporte_dias || ' DAYS')::INTERVAL \
                                ELSE j.fecha_inicio \
                            END) \
                        AND (i.fecha_intercambio IS NULL OR i.fecha_intercambio <= cj.prox_generacion_reporte) \
                    GROUP BY g.id_grupo, cj.prox_generacion_reporte, cj.freq_generacion_reporte_dias, j.fecha_inicio, g.dinero_actual \
                    ORDER BY g.id_grupo \
                RETURNING id_reporte,id_grupo",
                gameId
            );
            await t.any<ReporteStock>("\
                INSERT INTO reporte_stock (id_reporte,id_producto,stock_camion,stock_bodega)  \
                    SELECT r.id_reporte, spg.id_producto, spg.stock_camion, spg.stock_bodega  \
                    FROM reporte r  \
                        INNER JOIN grupo g ON g.id_grupo = r.id_grupo  \
                        INNER JOIN stock_producto_grupo spg ON g.id_grupo = spg.id_grupo  \
                    WHERE g.id_juego = $1 AND r.id_reporte > $2 AND (spg.stock_camion != 0 OR spg.stock_bodega != 0) \
                    ORDER BY r.id_reporte, g.id_grupo, spg.id_producto \
                RETURNING id_reporte,id_producto,stock_camion,stock_bodega",
                [gameId,c.count]
            );
            await t.one("\
                UPDATE config_juego \
                SET prox_generacion_reporte = prox_generacion_reporte + (freq_generacion_reporte_dias || ' DAYS')::INTERVAL \
                WHERE id_juego = $1 RETURNING id_juego",gameId
            );
            return true;
        });
    }

    static getReportData (gameId:number, generateDate:string) : Promise<ReportExcelData[]> {
        return pgQuery.any<ReportExcelData>("\
            SELECT g.id_grupo, g.nombre_grupo, r.fecha_inicio, r.fecha_fin, p.nombre AS nombre_persona, p.apellido_p, p.apellido_m, r.saldo_final, \
                g.bloques_extra, r.ingreso, r.egreso, r.utilidad, s.stock, t.transacciones \
            FROM reporte r  \
                INNER JOIN grupo g ON r.id_grupo = g.id_grupo \
                INNER JOIN jugador ju ON g.id_jugador_designado = ju.id_jugador \
                INNER JOIN persona p ON ju.id_alumno = p.id_persona \
                INNER JOIN juego j ON g.id_juego = j.id_juego \
                LEFT JOIN ( \
                    SELECT r.id_grupo,  \
                        json_agg(CASE WHEN rs.id_producto IS NOT NULL THEN json_build_object( \
                            'idProducto', rs.id_producto, \
                            'stockBodega', rs.stock_bodega, \
                            'stockCamion', rs.stock_camion \
                        ) END) AS stock \
                    FROM reporte r INNER JOIN reporte_stock rs ON r.id_reporte = rs.id_reporte \
                    WHERE r.fecha_fin = $2 \
                    GROUP BY r.id_grupo, r.id_reporte ORDER BY r.id_grupo, r.id_reporte \
                ) AS s ON r.id_grupo = s.id_grupo \
                LEFT JOIN ( \
                    SELECT r.id_grupo, json_agg( json_build_object( \
                            'idIntercambio', i.id_intercambio,  \
                            'fechaIntercambio', i.fecha_intercambio,  \
                            'idCiudad', i.id_ciudad, \
                            'detalle', prod.productos \
                        ) ) AS transacciones \
                    FROM reporte r \
                        INNER JOIN intercambio i ON r.id_grupo = i.id_grupo \
                        INNER JOIN ciudad c ON i.id_ciudad = c.id_ciudad \
                        INNER JOIN ( \
                            SELECT ip.id_intercambio, array_agg( \
                                    json_build_object( \
                                        'idProducto', ip.id_producto, \
                                        'esCompra', CASE WHEN ip.es_compra THEN 'COMPRA' ELSE 'VENTA' END, \
                                        'cantidad', ip.cantidad, \
                                        'precioUnitario', CASE WHEN ip.es_compra THEN ip.precio_compra ELSE ip.precio_venta END \
                                    ) ) AS productos \
                            FROM intercambio_producto ip \
                            GROUP BY ip.id_intercambio \
                            ORDER BY ip.id_intercambio \
                        ) AS prod ON i.id_intercambio = prod.id_intercambio \
                    WHERE i.fecha_intercambio > r.fecha_inicio AND i.fecha_intercambio <= r.fecha_fin AND r.fecha_fin = $2 \
                    GROUP BY r.id_grupo ORDER BY r.id_grupo \
                ) AS t ON r.id_grupo = t.id_grupo \
            WHERE g.id_juego = $1 AND r.fecha_fin = $2\
            ORDER BY g.id_grupo",[gameId,generateDate]
        );
    }
}