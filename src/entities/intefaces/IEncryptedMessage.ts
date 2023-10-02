export default interface IEncryptedMessage {
    iv: string;
    encryptedData: string;
    tag: string;
}
