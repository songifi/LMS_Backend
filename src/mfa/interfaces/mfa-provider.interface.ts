export interface MfaProvider {
    generateSecret(userId: string): Promise<string>;
    verify(userId: string, token: string): Promise<boolean>;
    getQrCodeUri?(userId: string, secret: string): Promise<string>;
  }