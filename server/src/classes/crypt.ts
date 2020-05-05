import Cryptr from 'cryptr';
import Bcrypt from 'bcryptjs';

export default class Crypt {
   
    /**
     * Encripta un ID de texto o numero. NO DEBE USARSE PARA CONSTRASEÑAS.    
     * @param id El ID que se encriptará.
     * @returns string con la cadena hash.
     */
    static encryptVal (id:string | number) : string {
        const cptr = new Cryptr(String(process.env.CRYPTR_KEY));
        return cptr.encrypt(typeof id === 'string' ? id : String(id));
    }

    /**
     * Desencripta una cadena hash.
     * @param hash El hash a desencriptar.  
     */
    static decryptVal (hash:string) : string {
        const cptr = new Cryptr(String(process.env.CRYPTR_KEY));
        return cptr.decrypt(hash);
    }

    /**
     * Encripta una contraseña usando Bcrypt.
     * @param pass La contraseña a encriptar.
     * @param cicles La cantidad de rondas. Por defecto es 13.
     */
    static encryptPass (pass:string, cicles:number = 13) : string {
        return Bcrypt.hashSync(pass, cicles);
    }

    /**
     * Comprueba si una cadena HASH encriptada con Bcrypt es válida para la contraseña entregada.
     * @param pass La contraseña a verificar.
     * @param hash El hash a comprobar con la contraseña respectiva.
     */
    static verifyPass (pass:string, hash:string) : boolean {
        return Bcrypt.compareSync(pass,hash);
    }
}