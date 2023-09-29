import {ISecret} from "./ISecret";

export default interface IUser {
    name: string;
    password: string;
    phone: string;
    salt: string;
    secret?: ISecret;
    messages?: any[];
}