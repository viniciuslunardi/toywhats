import User from "../entities/User";
import { usersDb } from "../entities/User";

export default class UserController {
    // Cria um usuário e seu salt e o armazena em memória
    static async create(name: string, login: string, password: string, phone: string, salt: string, secret: any): Partial<User> {
        // const user = new User(name, login, password, phone, salt, secret);
        // usersDb.push(user);
        // return user;
    }

    static list(): void  {
        return console.log(usersDb);
    }

    static get(name: string): User {
        return usersDb.filter(user => user.name === name).shift();
    }
}