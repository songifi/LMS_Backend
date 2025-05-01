import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MfaEntity } from '../entities/mfa.entity';
import { MfaMethod } from '../enums/mfa-method.enum';
import { MfaProvider } from '../interfaces/mfa-provider.interface';

@Injectable()
export class EmailService implements MfaProvider {
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

    // In a real implementation, you would send this code via email
    // using a service like SendGrid, AWS SES, etc.
    console.log(`Email code for user ${userId}: ${code}`);

    return 'Email verification enabled';
  }

  async verify(userId: string, token: string): Promise<boolean> {
    const mfaEntity = await this.mfaRepository.findOne({
      where: { userId, method: MfaMethod.EMAIL, isActive: true },
    });

    if (!mfaEntity || !mfaEntity.email) {
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

  async sendVerificationCode(userId: string, email: string): Promise<void> {
    let mfaEntity = await this.mfaRepository.findOne({
      where: { userId, method: MfaMethod.EMAIL },
    });

    if (!mfaEntity) {
      mfaEntity = await this.mfaRepository.save({
        userId,
        method: MfaMethod.EMAIL,
        email,
        isVerified: false,
        isActive: true,
      });
    } else {
      await this.mfaRepository.update(mfaEntity.id, { email, isActive: true });
    }

    await this.generateSecret(userId);
  }
}
