import * as crypto from 'crypto';
import IEncryptedMessage from "../entities/intefaces/IEncryptedMessage";

export class MessageController {

    encryptMessage(message: string, secret: string): IEncryptedMessage {
        // Gera um IV ou nonce
        const iv = crypto.randomBytes(16);

        // Derive salt do IV. Este é um exemplo simples e pode não ser ideal para todos os cenários.
        const salt = crypto.createHash('sha256').update(iv).digest().slice(0, 16);

        // Deriva a chave usando o secret e o salt
        const key = crypto.pbkdf2Sync(secret, salt, 1000, 32, 'sha512');
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        const encrypted = Buffer.concat([cipher.update(message, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();

        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted.toString('hex'),
            tag: tag.toString('hex'),
        };
    }

    decryptMessage(encryptedMessage: IEncryptedMessage, secret: string) {
        const iv = Buffer.from(encryptedMessage.iv, 'hex');

        // Derive salt do IV de forma idêntica à criptografia
        const salt = crypto.createHash('sha256').update(iv).digest().slice(0, 16);

        // Deriva a chave usando o secret e o salt
        const key = crypto.pbkdf2Sync(secret, salt, 1000, 32, 'sha512');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

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
