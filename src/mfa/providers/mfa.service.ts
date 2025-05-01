import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { MfaEntity } from './entities/mfa.entity';
import { MfaConfigEntity } from './entities/mfa-config.entity';
import { MfaRecoveryEntity } from './entities/mfa-recovery.entity';
import { MfaMethod } from './enums/mfa-method.enum';
import { TotpService } from './providers/totp.service';
import { SmsService } from './providers/sms.service';
import { EmailService } from './providers/email.service';
import { SetupMfaDto } from './dto/setup-mfa.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { VerifyRecoveryCodeDto } from './dto/recovery.dto';

@Injectable()
export class MfaService {
  private readonly mfaProviders: Map<MfaMethod, any>;

  constructor(
    @InjectRepository(MfaEntity)
    private mfaRepository: Repository<MfaEntity>,
    @InjectRepository(MfaConfigEntity)
    private mfaConfigRepository: Repository<MfaConfigEntity>,
    @InjectRepository(MfaRecoveryEntity)
    private mfaRecoveryRepository: Repository<MfaRecoveryEntity>,
    private totpService: TotpService,
    private smsService: SmsService,
    private emailService: EmailService,
  ) {
    this.mfaProviders = new Map([
      [MfaMethod.TOTP, this.totpService],
      [MfaMethod.SMS, this.smsService],
      [MfaMethod.EMAIL, this.emailService],
    ]);
  }

  async initializeConfig(): Promise<MfaConfigEntity> {
    let config = await this.mfaConfigRepository.findOne({ where: {} });
    
    if (!config) {
      config = await this.mfaConfigRepository.save({
        enforceMfa: false,
        requiredRoles: [],
        allowedMethods: [MfaMethod.TOTP, MfaMethod.SMS, MfaMethod.EMAIL],
        totpStepSeconds: 30,
        totpDigits: 6,
        totpAlgorithm: 'SHA1',
        recoveryCodesCount: 10,
        allowUserToManageMfa: true,
      });
    }
    
    return config;
  }

  async getConfig(): Promise<MfaConfigEntity> {
    const config = await this.mfaConfigRepository.findOne({ where: {} });
    if (!config) {
      return this.initializeConfig();
    }
    return config;
  }

  async getMfaStatusForUser(userId: string): Promise<any> {
    const methods = await this.mfaRepository.find({
      where: { userId, isActive: true },
    });

    return {
      hasMfa: methods.length > 0,
      activeMethods: methods.map(m => m.method),
      verifiedMethods: methods.filter(m => m.isVerified).map(m => m.method),
    };
  }

  async isMfaRequired(userId: string, userRoles: string[]): Promise<boolean> {
    const config = await this.getConfig();
    
    if (!config.enforceMfa) {
      return false;
    }

    if (config.requiredRoles.length === 0) {
      return true; // Enforce for all roles if no specific roles are set
    }

    return userRoles.some(role => config.requiredRoles.includes(role));
  }

  async setupMfa(userId: string, setupDto: SetupMfaDto): Promise<any> {
    const config = await this.getConfig();
    
    if (!config.allowedMethods.includes(setupDto.method)) {
      throw new BadRequestException(`MFA method ${setupDto.method} is not allowed.`);
    }

    const provider = this.mfaProviders.get(setupDto.method);
    if (!provider) {
      throw new BadRequestException(`Invalid MFA method: ${setupDto.method}`);
    }

    // Handle method-specific setup
    switch (setupDto.method) {
      case MfaMethod.TOTP:
        const secret = await provider.generateSecret(userId);
        const qrCodeUri = await provider.getQrCodeUri(userId, secret);
        return { secret, qrCodeUri };
      
      case MfaMethod.SMS:
        if (!setupDto.phoneNumber) {
          throw new BadRequestException('Phone number is required for SMS MFA.');
        }
        await provider.sendVerificationCode(userId, setupDto.phoneNumber);
        return { message: 'SMS verification code sent' };
      
      case MfaMethod.EMAIL:
        if (!setupDto.email) {
          throw new BadRequestException('Email is required for Email MFA.');
        }
        await provider.sendVerificationCode(userId, setupDto.email);
        return { message: 'Email verification code sent' };
    }
  }

  async verifyMfa(userId: string, verifyDto: VerifyMfaDto): Promise<boolean> {
    const provider = this.mfaProviders.get(verifyDto.method);
    if (!provider) {
      throw new BadRequestException(`Invalid MFA method: ${verifyDto.method}`);
    }

    return provider.verify(userId, verifyDto.token);
  }

  async disableMfa(userId: string, method?: MfaMethod): Promise<void> {
    if (method) {
      await this.mfaRepository.update(
        { userId, method },
        { isActive: false }
      );
    } else {
      await this.mfaRepository.update(
        { userId },
        { isActive: false }
      );
    }

    // Remove recovery codes when disabling all MFA methods
    if (!method) {
      await this.mfaRecoveryRepository.delete({ userId });
    }
  }

  async generateRecoveryCodes(userId: string): Promise<string[]> {
    const config = await this.getConfig();
    const mfaStatus = await this.getMfaStatusForUser(userId);

    if (!mfaStatus.verifiedMethods.length) {
      throw new BadRequestException('You must have at least one verified MFA method to generate recovery codes.');
    }

    // Remove existing recovery codes
    await this.mfaRecoveryRepository.delete({ userId });

    // Generate new recovery codes
    const codes: string[] = [];
    for (let i = 0; i < config.recoveryCodesCount; i++) {
      const code = crypto.randomBytes(10).toString('hex').slice(0, 16).toUpperCase();
      codes.push(code);
      
      // Save hashed version of the code
      const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
      await this.mfaRecoveryRepository.save({
        userId,
        code: hashedCode,
        isUsed: false,
      });
    }

    return codes;
  }

  async verifyRecoveryCode(userId: string, verifyDto: VerifyRecoveryCodeDto): Promise<boolean> {
    const hashedCode = crypto.createHash('sha256').update(verifyDto.code).digest('hex');

    const recoveryCode = await this.mfaRecoveryRepository.findOne({
      where: { userId, code: hashedCode, isUsed: false },
    });

    if (!recoveryCode) {
      return false;
    }

    // Mark the code as used
    await this.mfaRecoveryRepository.update(recoveryCode.id, { isUsed: true });
    return true;
  }
}
