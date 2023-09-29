import _ from "lodash";

import User from "../entities/User";
import IUser from "../entities/intefaces/IUser";
import authController from "./AuthController";
import twoFAController from "./TwoFAController";

const usersDb: User[] = [];

export default class UserController {
    // Cria um usuário e seu salt e o armazena em memória
    static async create(data: Partial<IUser>): Promise<Partial<IUser>> {
        const { name, password, phone } = data;

        if (name && password && phone) {
            if (UserController.get(name)) {
                throw new Error("Usuário já existe");
            }

            // auth controller retorna o hash e o salt
            const { hashedPass, salt } = authController.hashPassword(password);

            const user = new User(name, hashedPass, phone, salt);
            usersDb.push(user);

            // para debug
            console.log(user);

            await this.activate2FA(name);

            return {
                name: user.name,
                phone: user.phone
            };
        }
    }

    static async activate2FA(name: string): Promise<void> {
        const user = UserController.get(name);

        if (!user) {
            throw new Error("Usuário não existente");
        }

        user.secret = twoFAController.generate2FASecret(name);
        const qrCode = await twoFAController.generateQrcodeFromSecret(user.secret);

        UserController.set(user);

        // para debug
        console.log(qrCode);
    }


    static get(name: string): User {
        return usersDb.filter(user => user.name === name).shift();
    }

    static set(user: User): void {
         const index = _.findIndex(usersDb, { name: user.name });
         usersDb[index] = user;
    }

    static async authenticateUser(name: string, password: string, token: string): Promise<boolean> {
        const user = UserController.get(name);
        if (!user) {
            throw new Error("Usuário não existente");
        }

        // comparando sincronamente a senha informada com a senha hashada armazenada
        const validPassword = authController.validatePassword(password, user.password);

        if (!validPassword) {
            throw new Error("Senha inválida");
        }

        // validando o token 2FA
        const validToken = twoFAController.validate2FAToken(token, user.secret);

        if (!validToken) {
            throw new Error("Token inválido");
        }

        // user está autenticado
        // em sum cenário real, seria interssante salvar uma chave/cookie de sessão para o usuário e em toda request verificar se ainda está válida
        // a sessão invalidaria após um tempo de inatividade, após o usuário se deslogar, ou se o usuário fizer um novo login em outro dispositivo
        return true;
    }
}