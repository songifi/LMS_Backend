import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from "@nestjs/common"
import type { TenantService } from "./tenant.service"
import type { TenantProvisioningService } from "./tenant-provisioning.service"
import type { TenantResourceMonitoringService } from "./tenant-resource-monitoring.service"
import type { TenantMigrationService } from "./tenant-migration.service"
import type { CreateTenantDto } from "./dto/create-tenant.dto"
import type { UpdateTenantDto } from "./dto/update-tenant.dto"
import { BypassTenant } from "./decorators/tenant.decorator"
import { TenantGuard } from "./guards/tenant.guard"

@Controller("tenants")
@UseGuards(TenantGuard)
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly tenantProvisioningService: TenantProvisioningService,
    private readonly tenantResourceMonitoringService: TenantResourceMonitoringService,
    private readonly tenantMigrationService: TenantMigrationService,
  ) {}

  @Get()
  @BypassTenant()
  async findAll() {
    return this.tenantService.findAll()
  }

  @Get(':id')
  @BypassTenant()
  async findOne(@Param('id') id: string) {
    return this.tenantService.findById(id);
  }

  @Post()
  @BypassTenant()
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantProvisioningService.provisionTenant(createTenantDto);
  }

  @Put(":id")
  @BypassTenant()
  async update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(id, updateTenantDto)
  }

  @Delete(':id')
  @BypassTenant()
  async remove(@Param('id') id: string) {
    return this.tenantProvisioningService.deprovisionTenant(id);
  }

  @Get(':id/usage')
  @BypassTenant()
  async getUsage(@Param('id') id: string) {
    return this.tenantResourceMonitoringService.getTenantResourceUsage(id);
  }

  @Post(":id/export")
  @BypassTenant()
  async exportData(@Param('id') id: string, @Body() body: { outputPath: string }) {
    return this.tenantMigrationService.exportTenantData(id, body.outputPath)
  }

  @Post('import')
  @BypassTenant()
  async importData(@Body() body: { filePath: string; targetTenantId?: string }) {
    return this.tenantMigrationService.importTenantData(body.filePath, body.targetTenantId);
  }
}
