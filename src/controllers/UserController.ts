import User from "../entities/User";
import IUser from "../entities/intefaces/IUser";
import AuthController from "./AuthController";

const usersDb: User[] = [];

export default class UserController {
    // Cria um usuário e seu salt e o armazena em memória
    static create(data: Partial<IUser>): Partial<User> {
        const { name, password, phone } = data;

        if (name && password && phone) {
            if (UserController.get(name)) {
                throw new Error("Usuário já existe");
            }

            // auth controller retorna o hash e o salt
            const { hashedPass, salt } = AuthController.hashPassword(password);

            const user = new User(name, hashedPass, phone, salt);
            usersDb.push(user);

            // para debug
            console.log(user);

            return {
                name: user.name,
                phone: user.phone
            };
        }

    }

    static get(name: string): User {
        return usersDb.filter(user => user.name === name).shift();
    }
}