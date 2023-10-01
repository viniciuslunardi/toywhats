import * as crypto from 'crypto';
import IEncryptedMessage from "../entities/intefaces/IEncryptedMessage";

export class MessageController {

    encryptMessage(message: string, secret: string): IEncryptedMessage {
        // Gera um salt e uma chave derivada do secret (que aqui é o salt do usuário)
        const salt = crypto.randomBytes(16).toString('hex').slice(0, 16);
        const key = crypto.pbkdf2Sync(secret, salt, 1000, 32, 'sha512');

        // Gera um IV ou nonce e cifra a mensagem
        const iv = crypto.randomBytes(16); // usar pbkdf2Sync para gerar o IV
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        const encrypted = Buffer.concat([cipher.update(message, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();

        return {
            iv: iv.toString('hex'), //encoding em hexadecimal
            salt,
            encryptedData: encrypted.toString('hex'), //encoding em hexadecimal
            tag: tag.toString('hex'), //encoding em hexadecimal
        };
    }

    decryptMessage(encryptedMessage: IEncryptedMessage, secret: string) {
        // calcular o sal dnv
        // Deriva a chave usando o secret e salt da mesagem cifrada
        const key = crypto.pbkdf2Sync(secret, encryptedMessage.salt, 1000, 32, 'sha512');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(encryptedMessage.iv, 'hex'));

        decipher.setAuthTag(Buffer.from(encryptedMessage.tag, 'hex'));

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedMessage.encryptedData, 'hex')),
            decipher.final(),
        ]);

        return decrypted.toString('utf8');
    }
}

const messageController = new MessageController();
export default messageController;