import jwt from 'jsonwebtoken';

export interface JwtData {
    id: string,
    team: string | null
}

export default class Token {

    private static expire: string = '6h';

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
    static checkJwtToken ( userToken: string ): JwtData | null {
        let seed = String(process.env.JWT_SECRET);
        try {
            return (jwt.verify(userToken,seed) as JwtData);
        } catch (error) {
            return null;
        }
    }
    
}