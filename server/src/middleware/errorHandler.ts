export interface ErrorHandler {
    httpCode: number,
    body: {
        code: number,
        msg: string,
        err?: any
    }
}

/**
 * Genera el JSON a enviar en el response en base al código de error respectivo
 * @param err El error con el mensaje correspondiente
 * @param errData Datos a enviar en caso de WRONG_DATA
 * @returns ErrorHandler con todos los atributos (excepto err si no es WRONG_DATA)
 */
export default function checkError (err:Error, errData:any = {}) : ErrorHandler {
    switch (err.message) {
        // DATOS INCORRECTOS
        case 'WRONG_DATA':
            return { httpCode: 400, body: { code: 2501, msg: 'Datos incorrectos', err: errData} };
        // LOGIN
        case 'TEAMNAME_OR_PLAYER_NOT_FOUND':
            return { httpCode: 400, body: { code: 2601, msg: 'Los datos de acceso son incorrectos'} };
        case 'USER_NOT_FOUND':
            return { httpCode: 400, body: { code: 2602, msg: 'Los datos de acceso son incorrectos'} };
        case 'LOGIN_FAILED':
            return { httpCode: 400, body: { code: 2603, msg: 'Los datos de acceso son incorrectos'} };
        case 'UPDATE_LOGIN_FAILED':
            return { httpCode: 400, body: { code: 2604, msg: 'Hubo un problema al iniciar sesión. Reintente en unos minutos'} };
        case 'PLAYER_NOT_DESIGNATED':
            return { httpCode: 400, body: { code: 2605, msg: 'El jugador no es el lider designado'} };
        // TOKEN
        case 'INVALID_TOKEN':
            return { httpCode: 400, body: { code: 2701, msg: 'El token entregado es inválido'} };
        case 'TOKEN_NOT_DESTROYED':
            return { httpCode: 400, body: { code: 2702, msg: 'No se ha podido eliminar el token'} };
        case 'TOKEN_UPDATE_ERROR':
            return { httpCode: 400, body: { code: 2703, msg: 'No se ha podido renovar el token'} };
        // USER TYPE
        case 'USER_NOT_ADMIN':
            return { httpCode: 400, body: { code: 2801, msg: 'El usuario no es administrador'} };
        case 'USER_NOT_TEACHER':
            return { httpCode: 400, body: { code: 2802, msg: 'El usuario no es profesor'} };
        case 'USER_NOT_PLAYER':
            return { httpCode: 400, body: { code: 2803, msg: 'El usuario no es jugador'} };
        // OTROS
        case 'GAME_NOT_EXIST':
            return { httpCode: 400, body: { code: 2901, msg: 'El juego indicado no existe'} };
        case 'GROUP_NOT_EXIST_IN_THIS_GAME':
            return { httpCode: 400, body: { code: 1, msg: 'El grupo indicado no participa de este juego'} };
        case 'CITY_NOT_EXIST_IN_THIS_GAME':
            return { httpCode: 400, body: { code: 1, msg: 'La ciudad indicada no existe en este juego'} };
        case 'CITY_HAS_NOT_PRODUCT':
            return { httpCode: 400, body: { code: 1, msg: 'La ciudad no tiene uno de los productos indicados'} };
        case 'PRODUCT_NOT_EXIST_IN_THIS_GAME':
            return { httpCode: 400, body: { code: 1, msg: 'El producto indicado no existe en este juego'} };
        case 'PRODUCT_NOT_IN_CITY':
            return { httpCode: 400, body: { code: 1, msg: 'La ciudad no posee ese producto'} };
        case 'GROUP_WITHOUT_ENOUGH_MONEY':
            return { httpCode: 400, body: { code: 1, msg: 'El grupo no tiene suficiente dinero para la transacción'} };
        case 'GROUP_WITHOUT_AVAILABLE_BLOCKS':
            return { httpCode: 400, body: { code: 1, msg: 'El grupo no tiene bloques suficientes para guardar los productos'} };
        case 'CITY_PRODUCT_STOCK_INVALID':
            return { httpCode: 400, body: { code: 1, msg: 'La ciudad no tiene el stock suficiente de un producto para el intercambio'} };
        case 'GROUP_PRODUCT_STOCK_INVALID':
            return { httpCode: 400, body: { code: 1, msg: 'El grupo no tiene el stock suficiente de un producto para el intercambio'} };
        case 'PLAYER_NOT_EXIST_IN_THIS_GAME':
            return { httpCode: 400, body: { code: 1, msg: 'El jugador indicado no participa en este juego'} };
        case 'TRADE_NOT_EXIST':
            return { httpCode: 400, body: { code: 1, msg: 'El intercambio indicado no existe'} };
        default:
            console.log(err.message);
            return { httpCode: 500, body: { code: 1, msg: 'Error interno del servidor' } };
    }
}