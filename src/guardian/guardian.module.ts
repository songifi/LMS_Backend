import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Guardian } from "./entities/guardian.entity"
import { GuardianRelationship } from "./entities/guardian-relationship.entity"
import { PermissionGrant } from "./entities/permission-grant.entity"
import { ProgressSnapshot } from "./entities/progress-snapshot.entity"
import { GuardianMessage } from "./entities/guardian-message.entity"
import { GuardianNotification } from "./entities/guardian-notification.entity"
import { DependentGroup } from "./entities/dependent-group.entity"
import { GuardianController } from "./controllers/guardian.controller"
import { GuardianService } from "./providers/guardian.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Guardian,
      GuardianRelationship,
      PermissionGrant,
      ProgressSnapshot,
      GuardianMessage,
      GuardianNotification,
      DependentGroup,
    ]),
  ],
  controllers: [GuardianController],
  providers: [GuardianService],
  exports: [GuardianService],
})
export class GuardianModule {}
