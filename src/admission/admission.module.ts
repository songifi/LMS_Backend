import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { ApplicationForm } from './entities/application-form.entity';
import { FormField } from './entities/form-field.entity';
import { ApplicationDocument } from './entities/application-document.entity';
import { DocumentRequirement } from './entities/document-requirement.entity';
import { ApplicationReview } from './entities/application-review.entity';
import { ApplicationStatus } from './entities/application-status.entity';
import { ApplicationFee } from './entities/application-fee.entity';
import { ApplicationCommunication } from './entities/application-communication.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationForm,
      FormField,
      ApplicationDocument,
      DocumentRequirement,
      ApplicationReview,
      ApplicationStatus,
      ApplicationFee,
      ApplicationCommunication,
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AdmissionModule {}
