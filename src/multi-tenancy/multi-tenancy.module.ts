import { Module, Global } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { TenantService } from "./tenant.service"
import { TenantController } from "./tenant.controller"
import { TenantEntity } from "./entities/tenant.entity"
import { TenantConfigEntity } from "./entities/tenant-config.entity"
import { TenantUsageEntity } from "./entities/tenant-usage.entity"
import { TenantProvisioningService } from "./tenant-provisioning.service"
import { TenantContextMiddleware } from "./middleware/tenant-context.middleware"
import { TenantGuard } from "./guards/tenant.guard"
import { CrossTenantAuthorizationService } from "./cross-tenant-authorization.service"
import { TenantResourceMonitoringService } from "./tenant-resource-monitoring.service"
import { TenantMigrationService } from "./tenant-migration.service"

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity, TenantConfigEntity, TenantUsageEntity])],
  controllers: [TenantController],
  providers: [
    TenantService,
    TenantProvisioningService,
    TenantGuard,
    CrossTenantAuthorizationService,
    TenantResourceMonitoringService,
    TenantMigrationService,
    {
      provide: "APP_MIDDLEWARE",
      useClass: TenantContextMiddleware,
    },
  ],
  exports: [
    TenantService,
    TenantProvisioningService,
    TenantGuard,
    CrossTenantAuthorizationService,
    TenantResourceMonitoringService,
    TenantMigrationService,
  ],
})
export class MultiTenancyModule {}
