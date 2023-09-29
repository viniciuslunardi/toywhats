export default interface IEncryptedMessage {
    iv: string;
    salt: string;
    encryptedData: string;
    tag: string;
}
