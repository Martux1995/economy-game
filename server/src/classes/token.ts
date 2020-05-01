import jwt from 'jsonwebtoken';

export interface JwtData {
    id: string
}

export default class Token {

    private static seed: any = process.env.JWT_SECRET;
    private static expire: string = '1h';

    constructor() {}

    /**
     * Genera un token con los datos entregados
     * @param payload Los datos que se entregarán al token (JwtData).
     * @returns String con el token encriptado
     */
    static getJwtToken ( payload: JwtData ): string {
        return jwt.sign(payload, this.seed, { expiresIn: this.expire });
    }

    /**
     * Comprueba si el token entregado es válido o no
     * @param userToken El token a verificar si es o no correcto.
     */
    static checkJwtToken ( userToken: string ): string | Object | JwtData {
        try {
            return jwt.verify(userToken,this.seed);
        } catch (error) {
            return '';
        }
    }
    
}