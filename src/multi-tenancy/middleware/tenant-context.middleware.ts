import { Injectable, type NestMiddleware } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"
import type { TenantService } from "../tenant.service"
import { TenantContextStorage } from "../tenant-context"

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant identifier from various possible sources
    const tenantId = this.extractTenantId(req)
    const tenantSlug = this.extractTenantSlug(req)

    if (tenantId || tenantSlug) {
      try {
        let tenant

        if (tenantId) {
          tenant = await this.tenantService.findById(tenantId)
        } else if (tenantSlug) {
          tenant = await this.tenantService.findBySlug(tenantSlug)
        }

        if (tenant) {
          // Set the tenant context for this request
          TenantContextStorage.run({ tenantId: tenant.id, tenantSlug: tenant.slug }, () => next())
          return
        }
      } catch (error) {
        // If tenant not found, continue without setting context
      }
    }

    // If no tenant context could be established, continue without it
    next()
  }

  private extractTenantId(req: Request): string | undefined {
    // Try to extract tenant ID from various sources
    return (req.headers["x-tenant-id"] as string) || (req.query.tenantId as string) || undefined
  }

  private extractTenantSlug(req: Request): string | undefined {
    // Try to extract tenant slug from various sources
    // 1. From header
    if (req.headers["x-tenant-slug"]) {
      return req.headers["x-tenant-slug"] as string
    }

    // 2. From query parameter
    if (req.query.tenant) {
      return req.query.tenant as string
    }

    // 3. From subdomain (e.g., tenant-name.example.com)
    const host = req.headers.host
    if (host && host.includes(".") && !host.startsWith("www.")) {
      const subdomain = host.split(".")[0]
      if (subdomain) {
        return subdomain
      }
    }

    // 4. From URL path (e.g., /tenants/tenant-name/...)
    const pathParts = req.path.split("/")
    if (pathParts.length > 2 && pathParts[1] === "tenants") {
      return pathParts[2]
    }

    return undefined
  }
}
