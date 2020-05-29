import pgQuery from '../middleware/pgPromise';
import { Juego, Ciudad, JuegoDetalle, CiudadProducto, CiudadUpdateData, ProductUpdateData } from '../interfaces/game';

export default class TeacherModel {

    static getGames (teacherId:number) : Promise<Juego[]>{
        return pgQuery.any('\
            SELECT j.id_juego, j.nombre, j.semestre, j.concluido, j.fecha_inicio, j.fecha_termino \
            FROM juego j INNER JOIN ciudad c ON j.id_juego = c.id_juego \
            WHERE c.id_profesor = $1 AND c.vigente = TRUE',teacherId
        );
    }

    static getGameData (teacherId:number, gameId:number) : Promise<JuegoDetalle> {
        return pgQuery.one('\
            SELECT DISTINCT \
                j.id_juego, j.nombre, j.semestre, j.concluido, j.fecha_inicio, j.fecha_termino, \
                cj.dinero_inicial, cj.veces_compra_ciudad_dia, cj.se_puede_comerciar, \
                cj.se_puede_comprar_bloques, cj.max_bloques_camion, cj.max_bloques_bodega, \
                cj.precio_bloque_extra, cj.freq_cobro_bloque_extra_dias, cj.prox_cobro_bloque_extra, \
                cj.valor_impuesto, cj.freq_cobro_impuesto_dias, cj.prox_cobro_impuesto, \
                cj.freq_rotacion_lideres_dias, cj.prox_rotacion_lideres \
            FROM juego j INNER JOIN config_juego cj ON j.id_juego = cj.id_juego \
                INNER JOIN ciudad c ON j.id_juego = c.id_juego \
            WHERE c.id_profesor = $1 AND j.id_juego = $2 AND c.vigente = TRUE AND j.concluido = FALSE',
            [teacherId,gameId]
        ).catch( () => { throw Error('TEACHER_NOT_IN_GAME') } );
    }

    static getCities (teacherId:number) : Promise<Ciudad[]> {
        return pgQuery.any('\
            SELECT id_ciudad, nombre_ciudad, url_imagen, descripcion, hora_abre, hora_cierre, id_juego \
            FROM ciudad WHERE id_profesor = $1 AND vigente = TRUE',teacherId
        );
    }

    static getCityDataById (teacherId:number, cityId:number) : Promise<Ciudad> {
        return pgQuery.one('\
            SELECT id_ciudad, nombre_ciudad, url_imagen, descripcion, hora_abre, hora_cierre, id_juego, vigente \
            FROM ciudad WHERE id_profesor = $1 AND id_ciudad = $2',
            [teacherId,cityId]
        ).catch(err => { throw Error('CITY_NOT_FROM_TEACHER') });
    }

    static async updateCityData (teacherId:number, cityId:number, data:CiudadUpdateData) {
        await this.getCityDataById(teacherId,cityId);

        return pgQuery.one('\
            UPDATE ciudad \
            SET nombre_ciudad = $1, descripcion = $2, hora_abre = $3, hora_cierre = $4\
            WHERE id_ciudad = $5 RETURNING id_ciudad',
            [data.nombreCiudad, data.descripcion, data.horaAbre, data.horaCierre, cityId]
        );
    }

    static async getCityProducts(teacherId:number, cityId:number) : Promise<CiudadProducto[]> {
        await this.getCityDataById(teacherId,cityId);

        return pgQuery.any<CiudadProducto>('\
            SELECT p.id_producto, p.nombre AS nombre_producto, p.bloques_total, \
                pc.stock_actual, pc.stock_max, pc.precio_min, pc.precio_max, pc.factor_compra, pc.factor_venta, \
                pc.precio_compra, pc.precio_venta \
            FROM producto p INNER JOIN ciudad_producto pc ON pc.id_producto = p.id_producto \
                INNER JOIN ciudad c ON pc.id_ciudad = c.id_ciudad \
            WHERE c.vigente = TRUE AND p.vigente = TRUE AND pc.id_ciudad = $1',cityId
        );
    }

    static async getCityProductById(teacherId:number, cityId:number, productId:number) : Promise<CiudadProducto>{
        await this.getCityDataById(teacherId,cityId);

        return pgQuery.one<CiudadProducto>('\
            SELECT p.id_producto, p.nombre AS nombre_producto, p.bloques_total, \
                pc.stock_actual, pc.stock_max, pc.precio_min, pc.precio_max, pc.factor_compra, pc.factor_venta, \
                pc.precio_compra, pc.precio_venta \
            FROM producto p INNER JOIN ciudad_producto pc ON pc.id_producto = p.id_producto \
                INNER JOIN ciudad c ON pc.id_ciudad = c.id_ciudad \
            WHERE c.vigente = TRUE AND p.vigente = TRUE AND pc.id_ciudad = $1 AND pc.id_producto = $2',
            [cityId,productId]
        ).catch(() => { throw Error('PRODUCT_NOT_IN_CITY')});
    }

    static updateProducts (teacherId:number,cityId:number,data:ProductUpdateData[]) : Promise<boolean> {
        return pgQuery.tx(async t => {
            await this.getCityDataById(teacherId,cityId);

            for (const p of data) {
                await t.one('\
                    UPDATE ciudad_producto \
                    SET stock_actual = $1, stock_max = $2, precio_max = $3, precio_min = $4, \
                        factor_venta = TRUNC($5,3), factor_compra = TRUNC ( ($4::numeric - $3::numeric) / $2::numeric , 5 ) \
                    WHERE id_producto = $6 AND id_ciudad = $7 RETURNING id_producto',
                    [p.stockActual, p.stockMax, p.precioMax, p.precioMin, p.factorVenta, p.idProducto, cityId]
                );
            }

            await t.many('\
                UPDATE ciudad_producto \
                SET precio_compra = TRUNC( \
                        CASE WHEN stock_actual > stock_max THEN precio_min \
                        ELSE factor_compra * stock_actual + precio_max END \
                    ,0) \
                WHERE id_ciudad = $1 RETURNING id_ciudad',cityId
            );

            await t.many('\
                UPDATE ciudad_producto \
                SET precio_venta = TRUNC(factor_venta * precio_compra,0) \
                WHERE id_ciudad = $1 RETURNING id_ciudad',cityId
            );

            return true;
        });
    }

}