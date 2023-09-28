import IUser from "./intefaces/IUser";

export default class User implements IUser {
    name: string;
    password: string;
    phone: string;
    salt: string;
    secret: any;
    constructor(name: string, password: string, phone: string, salt: string, secret: any = null) {
        this.name = name;
        this.password = password;
        this.phone = phone;
        this.salt = salt;
        this.secret = secret;
    }
}