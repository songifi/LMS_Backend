import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Certificate } from './entities/certificate.entity';
import { Credential } from './entities/credential.entity';
import { VerificationRecord } from './entities/verification-record.entity';
import { CertificateTemplate } from './entities/certificate-template.entity';
import { IssuanceApproval } from './entities/issuance-approval.entity';
import { CredentialWallet } from './entities/credential-wallet.entity';
import { VerificationPortal } from './entities/verification-portal.entity';
import { CertificateController } from './certificate.controller';
import { CredentialController } from './credential.controller';
import { VerificationController } from './verification.controller';
import { ApprovalController } from './approval.controller';
import { CertificateService } from './certificate.service';
import { CredentialService } from './credential.service';
import { VerificationService } from './verification.service';
import { ApprovalService } from './approval.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Certificate,
      Credential,
      VerificationRecord,
      CertificateTemplate,
      IssuanceApproval,
      CredentialWallet,
      VerificationPortal,
      User
    ]),
  ],
  controllers: [
    CertificateController,
    CredentialController,
    VerificationController,
    ApprovalController,
  ],
  providers: [
    CertificateService,
    CredentialService,
    VerificationService,
    ApprovalService,
  ],
})
export class CredentialModule {}