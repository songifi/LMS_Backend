import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from "@nestjs/common"
import type { Observable } from "rxjs"
import type { DataSource } from "typeorm"
import { TenantContextStorage } from "../tenant-context"

@Injectable()
export class TenantDatabaseInterceptor implements NestInterceptor {
  constructor(private dataSource: DataSource) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const tenantId = TenantContextStorage.getTenantId()

    if (tenantId) {
      // Set the tenant_id in the PostgreSQL session for RLS
      await this.dataSource.query(`
        SET app.current_tenant_id = '${tenantId}';
      `)
    } else {
      // Clear the tenant_id if no tenant context
      await this.dataSource.query(`
        RESET app.current_tenant_id;
      `)
    }

    return next.handle()
  }
}
