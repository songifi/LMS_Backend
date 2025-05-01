import { SetMetadata } from "@nestjs/common"

export const TENANT_KEY = "requires_tenant"
export const RequiresTenant = () => SetMetadata(TENANT_KEY, true)

export const BYPASS_TENANT_KEY = "bypass_tenant"
export const BypassTenant = () => SetMetadata(BYPASS_TENANT_KEY, true)

export const CROSS_TENANT_KEY = "cross_tenant"
export const AllowCrossTenant = () => SetMetadata(CROSS_TENANT_KEY, true)
