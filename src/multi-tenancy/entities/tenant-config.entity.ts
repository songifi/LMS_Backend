import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm"
import { TenantEntity } from "./tenant.entity"

@Entity("tenant_configs")
export class TenantConfigEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  tenantId: string

  @OneToOne(
    () => TenantEntity,
    (tenant) => tenant.config,
  )
  @JoinColumn({ name: "tenantId" })
  tenant: TenantEntity

  @Column({ type: "jsonb", default: {} })
  settings: Record<string, any>

  @Column({ default: 100 })
  maxUsers: number

  @Column({ default: 5 })
  maxConcurrentSessions: number

  @Column({ default: "5GB" })
  storageQuota: string

  @Column({ default: 1000 })
  apiRequestsPerDay: number

  @Column({ default: true })
  enableAuditLogs: boolean

  @Column({ default: false })
  enableAdvancedFeatures: boolean
}
