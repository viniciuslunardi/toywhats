import { genSaltSync, hashSync, compareSync } from "bcryptjs";

export class AuthController {
    saltRounds = 10;

    generateSalt(): string {
        // Gera um salt aleatório, com o parâmetro saltRounds sendo o número de rounds (quantas interações o algoritmo de hash vai rodar)
        return genSaltSync(this.saltRounds);
    }

    hashPassword(password: string): { hashedPass: string, salt: string } {
        // Gera um salt aleatório
        const salt = this.generateSalt();
        const hashedPass = hashSync(password, salt);

        return {
            hashedPass,
            salt
        }
    }

    validatePassword(password: string, hashedPass: string): boolean {
        return compareSync(password, hashedPass);
    }
}

const authController = new AuthController();
export default authController;