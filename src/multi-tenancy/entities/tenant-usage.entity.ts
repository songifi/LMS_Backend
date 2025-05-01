import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm"
  import { TenantEntity } from "./tenant.entity"
  
  @Entity("tenant_usage")
  export class TenantUsageEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @Column({ type: "uuid" })
    tenantId: string
  
    @OneToOne(
      () => TenantEntity,
      (tenant) => tenant.usage,
    )
    @JoinColumn({ name: "tenantId" })
    tenant: TenantEntity
  
    @Column({ default: 0 })
    currentUsers: number
  
    @Column({ default: 0 })
    currentSessions: number
  
    @Column({ default: 0 })
    storageUsed: number
  
    @Column({ default: 0 })
    apiRequestsToday: number
  
    @Column({ type: "jsonb", default: {} })
    resourceUsage: Record<string, any>
  
    @CreateDateColumn()
    createdAt: Date
  
    @UpdateDateColumn()
    updatedAt: Date
  }
  