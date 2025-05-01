import { AsyncLocalStorage } from "async_hooks"

export interface TenantContext {
  tenantId: string
  tenantSlug: string
}

export class TenantContextStorage {
  private static storage = new AsyncLocalStorage<TenantContext>()

  static getContext(): TenantContext | undefined {
    return this.storage.getStore()
  }

  static getTenantId(): string | undefined {
    return this.getContext()?.tenantId
  }

  static getTenantSlug(): string | undefined {
    return this.getContext()?.tenantSlug
  }

  static run(context: TenantContext, callback: () => any): any {
    return this.storage.run(context, callback)
  }
}
