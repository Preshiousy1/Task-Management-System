import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthenticatorService {
  public generateSecret(): string {
    return authenticator.generateSecret();
  }

  public static verifySecret(payload: {
    token: string;
    secret: string;
  }): boolean {
    return authenticator.verify(payload);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async generateBarCode(
    appName: string,
    email: string,
    secret: string,
  ): Promise<string> {
    return toDataURL(authenticator.keyuri(email, appName, secret));
  }
}
