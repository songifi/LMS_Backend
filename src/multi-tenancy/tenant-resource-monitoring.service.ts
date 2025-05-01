import { Injectable, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { TenantEntity } from "./entities/tenant.entity"
import { TenantUsageEntity } from "./entities/tenant-usage.entity"
import { TenantConfigEntity } from "./entities/tenant-config.entity"
import { TenantContextStorage } from "./tenant-context"

@Injectable()
export class TenantResourceMonitoringService {
  constructor(
    @InjectRepository(TenantEntity)
    private tenantRepository: Repository<TenantEntity>,
    @InjectRepository(TenantUsageEntity)
    private tenantUsageRepository: Repository<TenantUsageEntity>,
    @InjectRepository(TenantConfigEntity)
    private tenantConfigRepository: Repository<TenantConfigEntity>,
  ) {}

  async trackResourceUsage(resourceType: string, amount: number, tenantId?: string): Promise<void> {
    // Get tenant ID from context if not provided
    const effectiveTenantId = tenantId || TenantContextStorage.getTenantId()

    if (!effectiveTenantId) {
      throw new BadRequestException("No tenant context available for resource tracking")
    }

    // Get current usage
    const usage = await this.tenantUsageRepository.findOne({
      where: { tenantId: effectiveTenantId },
    })

    if (!usage) {
      throw new BadRequestException(`Usage record not found for tenant ${effectiveTenantId}`)
    }

    // Update the specific resource usage
    if (!usage.resourceUsage[resourceType]) {
      usage.resourceUsage[resourceType] = 0
    }

    usage.resourceUsage[resourceType] += amount

    // Update specific counters based on resource type
    switch (resourceType) {
      case "api_request":
        usage.apiRequestsToday += amount
        break
      case "storage":
        usage.storageUsed += amount
        break
      case "user":
        usage.currentUsers += amount
        break
      case "session":
        usage.currentSessions += amount
        break
    }

    await this.tenantUsageRepository.save(usage)

    // Check if quota exceeded
    await this.checkQuotaExceeded(effectiveTenantId)
  }

  async checkQuotaExceeded(tenantId: string): Promise<boolean> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ["config", "usage"],
    })

    if (!tenant || !tenant.config || !tenant.usage) {
      throw new BadRequestException(`Tenant ${tenantId} not found or missing config/usage`)
    }

    // Check various quotas
    if (tenant.usage.apiRequestsToday > tenant.config.apiRequestsPerDay) {
      // API quota exceeded
      return true
    }

    if (tenant.usage.currentUsers > tenant.config.maxUsers) {
      // User quota exceeded
      return true
    }

    if (tenant.usage.currentSessions > tenant.config.maxConcurrentSessions) {
      // Session quota exceeded
      return true
    }

    // Parse storage quota (e.g., "5GB")
    const storageQuotaMatch = tenant.config.storageQuota.match(/(\d+)([A-Za-z]+)/)
    if (storageQuotaMatch) {
      const amount = Number.parseInt(storageQuotaMatch[1])
      const unit = storageQuotaMatch[2].toLowerCase()

      let quotaInBytes = amount
      if (unit === "kb") quotaInBytes *= 1024
      if (unit === "mb") quotaInBytes *= 1024 * 1024
      if (unit === "gb") quotaInBytes *= 1024 * 1024 * 1024
      if (unit === "tb") quotaInBytes *= 1024 * 1024 * 1024 * 1024

      if (tenant.usage.storageUsed > quotaInBytes) {
        // Storage quota exceeded
        return true
      }
    }

    return false
  }

  async resetDailyCounters(): Promise<void> {
    // Reset daily counters for all tenants
    // This should be called by a scheduled job at midnight
    await this.tenantUsageRepository.query(`
      UPDATE tenant_usage
      SET api_requests_today = 0;
    `)
  }

  async getTenantResourceUsage(tenantId: string): Promise<any> {
    const usage = await this.tenantUsageRepository.findOne({
      where: { tenantId },
    })

    if (!usage) {
      throw new BadRequestException(`Usage record not found for tenant ${tenantId}`)
    }

    const config = await this.tenantConfigRepository.findOne({
      where: { tenantId },
    })

    return {
      usage,
      config,
      quotaPercentages: {
        apiRequests: (usage.apiRequestsToday / config.apiRequestsPerDay) * 100,
        users: (usage.currentUsers / config.maxUsers) * 100,
        sessions: (usage.currentSessions / config.maxConcurrentSessions) * 100,
        // Calculate storage percentage
      },
    }
  }
}
