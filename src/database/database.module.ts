import { Module, Global } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { DatabaseBackupService } from "./backup.service"
import { ConfigModule } from "@nestjs/config"
import { QueryPerformanceService } from "./query-performance.service"
import { TransactionManager } from "./transaction.utils"
import { DatabaseAdminController } from "./database-admin.controller"
import { DatabaseHealthController } from "./database-health.controller"

@Global()
@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule],
  controllers: [DatabaseAdminController, DatabaseHealthController],
  providers: [DatabaseBackupService, QueryPerformanceService, TransactionManager],
  exports: [DatabaseBackupService, QueryPerformanceService, TransactionManager],
})
export class DatabaseModule {}
