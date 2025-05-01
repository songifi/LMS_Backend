import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MfaEntity } from '../entities/mfa.entity';
import { MfaMethod } from '../enums/mfa-method.enum';
import { MfaProvider } from '../interfaces/mfa-provider.interface';

@Injectable()
export class SmsService implements MfaProvider {
  private readonly codeExpiryTime = 10 * 60 * 1000; // 10 minutes
  private readonly codeCacheMap = new Map<string, { code: string; timestamp: number }>();

  constructor(
    @InjectRepository(MfaEntity)
    private mfaRepository: Repository<MfaEntity>,
    private configService: ConfigService,
  ) {}

  async generateSecret(userId: string): Promise<string> {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.codeCacheMap.set(userId, { code, timestamp: Date.now() });

    // In a real implementation, you would send this code via SMS
    // using a service like Twilio, AWS SNS, etc.
    console.log(`SMS code for user ${userId}: ${code}`);

    return 'SMS verification enabled';
  }

  async verify(userId: string, token: string): Promise<boolean> {
    const mfaEntity = await this.mfaRepository.findOne({
      where: { userId, method: MfaMethod.SMS, isActive: true },
    });

    if (!mfaEntity || !mfaEntity.phoneNumber) {
      return false;
    }

    const codeData = this.codeCacheMap.get(userId);
    if (!codeData) {
      return false;
    }

    const { code, timestamp } = codeData;
    const isExpired = Date.now() - timestamp > this.codeExpiryTime;
    
    if (isExpired) {
      this.codeCacheMap.delete(userId);
      return false;
    }

    const isValid = code === token;
    
    if (isValid) {
      this.codeCacheMap.delete(userId);
      if (!mfaEntity.isVerified) {
        await this.mfaRepository.update(mfaEntity.id, { isVerified: true });
      }
    }

    return isValid;
  }

  async sendVerificationCode(userId: string, phoneNumber: string): Promise<void> {
    let mfaEntity = await this.mfaRepository.findOne({
      where: { userId, method: MfaMethod.SMS },
    });

    if (!mfaEntity) {
      mfaEntity = await this.mfaRepository.save({
        userId,
        method: MfaMethod.SMS,
        phoneNumber,
        isVerified: false,
        isActive: true,
      });
    } else {
      await this.mfaRepository.update(mfaEntity.id, { phoneNumber, isActive: true });
    }

    await this.generateSecret(userId);
  }
}