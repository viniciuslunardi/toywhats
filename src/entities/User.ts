import IUser from "./intefaces/IUser";

export default class User implements IUser {
    name: string;
    login: string;
    password: string;
    phone: string;
    salt: string;
    secret: any;
    constructor(name: string, login: string, password: string, phone: string, salt: string, secret: any) {
        this.name = name;
        this.login = login;
        this.password = password;
        this.phone = phone;
        this.salt = salt;
        this.secret = secret;
    }
}

// Armazenamento de usuários em memória
export const usersDb: User[] = [];