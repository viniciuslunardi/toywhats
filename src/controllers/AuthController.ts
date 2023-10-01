import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// transforma a função scrypt em uma função que retorna uma Promise,
// para não travar a thread de execução uma vez que a função scrypt é síncrona e pode ser custosa
const scryptAsync = promisify(scrypt);

export class AuthController {
    private saltLength = 16;

    async generateSalt(): Promise<string> {
        return randomBytes(this.saltLength).toString('hex');
    }

    async hashPassword(password: string): Promise<{ hashedPass: string, salt: string }> {
        const salt = await this.generateSalt();
        // hash da senha com o salt no tamanho de 64 bytes
        const hashedPassBuffer = await scryptAsync(password, salt, 64);
        return {
            hashedPass: hashedPassBuffer.toString('hex'), // convertendo para hexadecimal, fica um hash com 128 caracteres
            salt
        };
    }

    async validatePassword(password: string, hashedPass: string, salt: string): Promise<boolean> {
        const hashedPassBuffer = await scryptAsync(password, salt, 64);
        return hashedPassBuffer.toString('hex') === hashedPass;
    }
}

const authController = new AuthController();
export default authController;
