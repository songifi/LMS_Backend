import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException } from "@nestjs/common"
import type { Reflector } from "@nestjs/core"
import { TenantContextStorage } from "../tenant-context"
import { TENANT_KEY } from "../decorators/tenant.decorator"

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresTenant = this.reflector.getAllAndOverride<boolean>(TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // If the endpoint doesn't require tenant context, allow access
    if (!requiresTenant) {
      return true
    }

    const tenantContext = TenantContextStorage.getContext()

    // If tenant context is required but not present, deny access
    if (!tenantContext || !tenantContext.tenantId) {
      throw new ForbiddenException("Tenant context is required for this operation")
    }

    return true
  }
}
