import jwt from 'jsonwebtoken';

export interface JwtData {
    id: string
}

export default class Token {

    private static expire: string = '1h';

    constructor() {}

    /**
     * Genera un token con los datos entregados
     * @param payload Los datos que se entregarán al token (JwtData).
     * @returns String con el token encriptado
     */
    static getJwtToken ( payload: JwtData ): string {
        let seed = String(process.env.JWT_SECRET);
        return jwt.sign(payload, seed, { expiresIn: this.expire });
    }

    /**
     * Comprueba si el token entregado es válido o no
     * @param userToken El token a verificar si es o no correcto.
     */
    static checkJwtToken ( userToken: string ): string | Object | JwtData {
        let seed = String(process.env.JWT_SECRET);
        try {
            return jwt.verify(userToken,seed);
        } catch (error) {
            return '';
        }
    }
    
}