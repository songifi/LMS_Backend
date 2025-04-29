import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EnrollmentPeriodController } from './controllers/enrollment-period.controller'
import { RegistrationController } from './controllers/registration.controller'
import { WaitlistController } from './controllers/waitlist.controller'
import { EnrollmentApprovalController } from './controllers/enrollment-approval.controller'
import { EnrollmentHistoryController } from './controllers/enrollment-history.controller'
import { EnrollmentPeriod } from './entities/enrollment-period.entity'
import { Registration } from './entities/registration.entity'
import { Waitlist } from './entities/waitlist.entity'
import { WaitlistPosition } from './entities/waitlist-position.entity'
import { EnrollmentApproval } from './entities/enrollment-approval.entity'
import { RegistrationHistory } from './entities/registration-history.entity'
import { EnrollmentPayment } from './entities/enrollment-payment.entity'
import { EnrollmentPeriodService } from './providers/enrollment-period.service'
import { RegistrationService } from './providers/registration.service'
import { WaitlistService } from './providers/waitlist.service'
import { EnrollmentApprovalService } from './providers/enrollment-approval.service'
import { EnrollmentHistoryService } from './providers/enrollment-history.service'
import { EnrollmentPaymentService } from './providers/enrollment-payment.service'
import { PrerequisiteService } from './providers/prerequisite.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EnrollmentPeriod,
      Registration,
      Waitlist,
      WaitlistPosition,
      EnrollmentApproval,
      RegistrationHistory,
      EnrollmentPayment,
    ]),
    forwardRef(() => EnrollmentModule), 
  ],
  controllers: [
    EnrollmentPeriodController,
    RegistrationController,
    WaitlistController,
    EnrollmentApprovalController,
    EnrollmentHistoryController,
  ],
  providers: [
    EnrollmentPeriodService,
    RegistrationService,
    WaitlistService,
    EnrollmentApprovalService,
    EnrollmentHistoryService,
    EnrollmentPaymentService,
    PrerequisiteService,
  ],
  exports: [
    EnrollmentPeriodService,
    RegistrationService,
    WaitlistService,
    EnrollmentApprovalService,
    EnrollmentHistoryService,
    EnrollmentPaymentService,
    PrerequisiteService,
  ],
})
export class EnrollmentModule {}
