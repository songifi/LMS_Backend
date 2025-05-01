import { Injectable, ForbiddenException } from "@nestjs/common"
import type { TenantService } from "./tenant.service"
import { TenantContextStorage } from "./tenant-context"

@Injectable()
export class CrossTenantAuthorizationService {
  constructor(private readonly tenantService: TenantService) {}

  async authorizeOperation(targetTenantId: string, operation: string): Promise<boolean> {
    const currentTenantId = TenantContextStorage.getTenantId()

    // If no tenant context, deny cross-tenant operations
    if (!currentTenantId) {
      throw new ForbiddenException("No tenant context available for cross-tenant operation")
    }

    // If same tenant, no cross-tenant authorization needed
    if (currentTenantId === targetTenantId) {
      return true
    }

    // Check if the current tenant has permission for this operation on the target tenant
    const hasPermission = await this.checkCrossTenantPermission(currentTenantId, targetTenantId, operation)

    if (!hasPermission) {
      throw new ForbiddenException(
        `Tenant ${currentTenantId} is not authorized to perform ${operation} on tenant ${targetTenantId}`,
      )
    }

    return true
  }

  private async checkCrossTenantPermission(
    sourceTenantId: string,
    targetTenantId: string,
    operation: string,
  ): Promise<boolean> {
    // Implement your permission checking logic here
    // This could involve checking a permissions table, tenant relationships, etc.

    // Example implementation:
    const sourceTenant = await this.tenantService.findById(sourceTenantId)
    const targetTenant = await this.tenantService.findById(targetTenantId)

    // Example: Only enterprise tenants can perform cross-tenant operations
    if (sourceTenant.isEnterprise) {
      // Check specific operation permissions
      switch (operation) {
        case "READ":
          return true // Enterprise tenants can read from any tenant
        case "WRITE":
          return false // No tenant can write to another tenant
        case "ADMIN":
          return false // No tenant can admin another tenant
        default:
          return false
      }
    }

    return false
  }

  async withTargetTenant<T>(targetTenantId: string, callback: () => Promise<T>): Promise<T> {
    // Store the current tenant context
    const currentContext = TenantContextStorage.getContext()

    try {
      // Get the target tenant
      const targetTenant = await this.tenantService.findById(targetTenantId)

      // Execute the callback in the context of the target tenant
      return await TenantContextStorage.run({ tenantId: targetTenant.id, tenantSlug: targetTenant.slug }, callback)
    } finally {
      // Restore the original tenant context if it existed
      if (currentContext) {
        TenantContextStorage.run(currentContext, () => {})
      }
    }
  }
}
