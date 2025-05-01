import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MfaController } from './mfa.controller';
import { MfaService } from './mfa.service';
import { TotpService } from './providers/totp.service';
import { SmsService } from './providers/sms.service';
import { EmailService } from './providers/email.service';
import { MfaEntity } from './entities/mfa.entity';
import { MfaConfigEntity } from './entities/mfa-config.entity';
import { MfaRecoveryEntity } from './entities/mfa-recovery.entity';
import { MfaAdminController } from './admin/mfa-admin.controller';
import { MfaAdminService } from './admin/mfa-admin.service';
import { MfaGuard } from './guards/mfa.guard';
import { MfaStrategy } from './strategies/mfa.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([MfaEntity, MfaConfigEntity, MfaRecoveryEntity]),
  ],
  controllers: [MfaController, MfaAdminController],
  providers: [
    MfaService,
    TotpService,
    SmsService,
    EmailService,
    MfaAdminService,
    MfaGuard,
    MfaStrategy,
  ],
  exports: [MfaService, MfaGuard, MfaStrategy],
})
export class MfaModule {}
