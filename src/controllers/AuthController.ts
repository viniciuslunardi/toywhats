import { genSaltSync, hashSync } from "bcryptjs";

class AuthController {
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
}

export default new AuthController();