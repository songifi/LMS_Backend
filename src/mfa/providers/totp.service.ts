import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { MfaEntity } from '../entities/mfa.entity';
import { MfaConfigEntity } from '../entities/mfa-config.entity';
import { MfaMethod } from '../enums/mfa-method.enum';
import { MfaProvider } from '../interfaces/mfa-provider.interface';

@Injectable()
export class TotpService implements MfaProvider {
  constructor(
    @InjectRepository(MfaEntity)
    private mfaRepository: Repository<MfaEntity>,
    @InjectRepository(MfaConfigEntity)
    private mfaConfigRepository: Repository<MfaConfigEntity>,
    private configService: ConfigService,
  ) {}

  async generateSecret(userId: string): Promise<string> {
    const config = await this.mfaConfigRepository.findOne({ where: {} });
    
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${this.configService.get('APP_NAME')}:${userId}`,
    });

    await this.mfaRepository.save({
      userId,
      method: MfaMethod.TOTP,
      secret: secret.base32,
      isVerified: false,
      isActive: true,
    });

    return secret.base32;
  }

  async verify(userId: string, token: string): Promise<boolean> {
    const mfaEntity = await this.mfaRepository.findOne({
      where: { userId, method: MfaMethod.TOTP, isActive: true },
    });

    if (!mfaEntity || !mfaEntity.secret) {
      return false;
    }

    const config = await this.mfaConfigRepository.findOne({ where: {} });
    
    const verified = speakeasy.totp.verify({
      secret: mfaEntity.secret,
      encoding: 'base32',
      token,
      window: 1,
      step: config?.totpStepSeconds || 30,
      digits: config?.totpDigits || 6,
      algorithm: config?.totpAlgorithm || 'SHA1',
    });

    if (verified && !mfaEntity.isVerified) {
      await this.mfaRepository.update(mfaEntity.id, { isVerified: true });
    }

    return verified;
  }

  async getQrCodeUri(userId: string, secret: string): Promise<string> {
    const appName = this.configService.get('APP_NAME', 'MyApp');
    const otpauth = speakeasy.otpauth_url({
      secret,
      label: `${appName}:${userId}`,
      issuer: appName,
      encoding: 'base32',
    });

    return qrcode.toDataURL(otpauth);
  }
}
