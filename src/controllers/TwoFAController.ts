import * as speakeasy from 'speakeasy';
import { toDataURL } from "qrcode";
import * as QRCode from 'qrcode-terminal';

import { AuthController } from "./AuthController";


export class TwoFAController extends AuthController {
    // data == user.name
    generate2FASecret(data: string): speakeasy.GeneratedSecret {
        return speakeasy.generateSecret({
            name: `secretToyWhats:${data}`
        });
    }

    validate2FAToken(token: string, secret: speakeasy.GeneratedSecret): boolean {
        return speakeasy.totp.verify({
            secret: secret.base32,
            encoding: "base32",
            token
        });
    }

    async generateQrcodeFromSecret(secret: speakeasy.GeneratedSecretWithOtpAuthUrl) {
        try {
            QRCode.generate(secret.otpauth_url, { small: true });

           return await toDataURL(secret.otpauth_url);
        } catch (error) {
            throw new Error(error);
        }
    }
}

const twoFAController = new TwoFAController();
export default twoFAController;