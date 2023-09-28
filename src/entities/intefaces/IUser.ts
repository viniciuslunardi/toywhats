import {ISecret} from "./ISecret";

export default interface IUser {
    name: string;
    login: string;
    password: string;
    phone: string;
    salt: string;
    secret?: ISecret;
}