import type { DataSource, EntitySubscriberInterface, InsertEvent, UpdateEvent } from "typeorm"
import { Injectable } from "@nestjs/common"
import { TenantContextStorage } from "../tenant-context"

@Injectable()
export class TenantEntitySubscriber implements EntitySubscriberInterface {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this)
  }

  /**
   * Called before entity insertion
   */
  beforeInsert(event: InsertEvent<any>) {
    this.setTenantId(event.entity)
  }

  /**
   * Called before entity update
   */
  beforeUpdate(event: UpdateEvent<any>) {
    // Prevent changing tenant_id on update
    if (event.entity && event.entity.tenant_id && event.databaseEntity.tenant_id) {
      if (event.entity.tenant_id !== event.databaseEntity.tenant_id) {
        event.entity.tenant_id = event.databaseEntity.tenant_id
      }
    }
  }

  /**
   * Sets tenant id from current context
   */
  private setTenantId(entity: any) {
    // Skip if entity doesn't have tenant_id property
    if (!entity || !this.hasTenantIdColumn(entity)) {
      return
    }

    // Skip if tenant_id is already set
    if (entity.tenant_id) {
      return
    }

    // Get current tenant from context
    const tenantId = TenantContextStorage.getTenantId()
    if (tenantId) {
      entity.tenant_id = tenantId
    }
  }

  /**
   * Checks if entity has tenant_id column
   */
  private hasTenantIdColumn(entity: any): boolean {
    return entity.hasOwnProperty("tenant_id")
  }
}
