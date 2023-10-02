import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import _ from "lodash";
import {Router} from "express";

import User from "../entities/User";
import IUser from "../entities/intefaces/IUser";
import authController from "./AuthController";
import twoFAController from "./TwoFAController";
import messageController from "./MessageController";

const usersDbFile = path.join('./', 'usersDb.json');


export default class UserController {
    router: Router;
    constructor(router: Router) {
        this.router = router;
        this.initRoutes();
    }

    initRoutes(): void {
        //rotas abertas
        this.router.post('/register', this.registerRoute.bind(this));
        this.router.post('/login', this.loginRoute.bind(this));

        //rotas autenticadas
        //no mundo real, estas rotas precisariam verificar se um usuário está autenticado antes de executar a ação
        //utilizando um middleware de autenticação por exemplo
        this.router.get('', this.listRoute.bind(this));
        this.router.post('/sendMessage', this.sendMessageRoute.bind(this));
        this.router.get('/read-messages/:name', this.readMessagesRoute.bind(this));
        this.router.get('/read-decrypted-messages/:name', this.readDecryptedMessagesRoute.bind(this));
    }

    //routes
    async listRoute(req: Request, res: Response): Promise<Response> {
        try {
            const users = UserController.list();
            return res.status(200).json({ users });
        } catch (err) {
            return res.status(401).json({ error: err.message });
        }
    }

    async registerRoute(req: Request, res: Response): Promise<Response> {
        const { name, password, phone } = req.body;
        try {
            await UserController.create({ name, password, phone });
            return res.status(201).json({ message: "Usuário criado com sucesso" });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    async loginRoute(req: Request, res: Response): Promise<Response> {
        const { name, password, token } = req.body;
        try {
            await UserController.authenticateUser(name, password, token);
            return res.status(200).json({ message: "Usuário autenticado com sucesso" });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    async sendMessageRoute(req: Request, res: Response): Promise<Response> {
        // num nundo real, buscariamos a sessão do usuário para setá-lo como remetente
        const { message, to, from } = req.body;
        try {
            await this.sendMessage(message, to, from);
            return res.status(200).json({ message: "Mensagem enviada com sucesso" });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    async readMessagesRoute(req: Request, res: Response): Promise<Response> {
        const { name } = req.params;
        try {
            const messages = await this.readMessages(name);
            return res.status(200).json({ messages });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    async readDecryptedMessagesRoute(req: Request, res: Response): Promise<Response> {
        const { name } = req.params;
        try {
            const decryptedMessages = await this.readDecryptedMessages(name);
            return res.status(200).json({ decryptedMessages });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    // methods
    static async create(data: Partial<IUser>): Promise<Partial<IUser> | undefined> {
        const { name, password, phone } = data;

        if (name && password && phone) {
            if (UserController.get(name)) {
                throw new Error("Usuário já existe");
            }

            // auth controller retorna o hash e o salt
            const { hashedPass, salt } = await authController.hashPassword(password);

            const user = new User(name, hashedPass, phone, salt);
            usersDb.push(user);

            // para debug
            console.log(user);

            await this.activate2FA(name);

            await this.saveUsersDbToFile();
            return {
                name: user.name,
                phone: user.phone
            };
        }
    }

    static saveUsersDbToFile() {
        fs.writeFileSync(usersDbFile, JSON.stringify(usersDb, null, 4));
    }

    static loadUsersDbFromFile() {
        if (fs.existsSync(usersDbFile)) {
            const data = fs.readFileSync(usersDbFile, 'utf8');
            return JSON.parse(data) as User[];
        }
        return [];
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


    static get(name: string): User | undefined {
        return usersDb.filter((user: User) => user.name === name).shift();
    }

    static set(user: User): void {
         const index = _.findIndex(usersDb, { name: user.name });
         usersDb[index] = user;
         UserController.saveUsersDbToFile()
    }

    async sendMessage(message: string, to: string, from: string): Promise<void> {
        const reciever = UserController.get(to);
        const sender = UserController.get(from);
        if (!reciever) {
            throw new Error("Usuário destinário não existente");
        } else if (!sender) {
            throw new Error("Usuário remetende não existente");
        }

        const secretForMessage = authController.generateSecret();
        const encryptedSecret = messageController.encryptMessage(secretForMessage, reciever.salt);
        const encryptedMessageData = messageController.encryptMessage(message, secretForMessage);

        reciever.messages.push({
            encryptedData: encryptedMessageData,
            reciever: reciever.name,
            sender: sender.name,
            encryptedSecret: encryptedSecret
        });

        UserController.set(reciever);
    }


    async readMessages(name: string): Promise<string[]> {
        const user = UserController.get(name);
        if (!user) {
            throw new Error("Usuário não existente");
        }

        return user.messages.map(m => m.encryptedData.encryptedData)
    }

    async readDecryptedMessages(name: string): Promise<any[]> {
        const user = UserController.get(name);
        if (!user) {
            throw new Error("Usuário não existente");
        }

        return user.messages.map(message => {
            const secretForMessage = messageController.decryptMessage(message.encryptedSecret, user.salt);
            const msg = messageController.decryptMessage(message.encryptedData , secretForMessage);
            return {
                message: msg,
                sender: message.sender,
                reciever: message.reciever
            }
        });
    }

    static async authenticateUser(name: string, password: string, token: string): Promise<boolean> {
        const user = UserController.get(name);
        if (!user) {
            throw new Error("Usuário não existente");
        }

        // comparando sincronamente a senha informada com a senha hashada armazenada
        const validPassword = authController.validatePassword(password, user.password, user.salt);

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

    //list all users
    static list(): User[] {
        return usersDb;
    }
}

const usersDb: User[] = UserController.loadUsersDbFromFile();