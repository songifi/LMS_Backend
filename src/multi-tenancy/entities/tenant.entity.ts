import { Entity, Column, PrimaryGeneratedColumn, OneToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { TenantConfigEntity } from "./tenant-config.entity"
import { TenantUsageEntity } from "./tenant-usage.entity"

export enum TenantStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  PENDING = "pending",
  ARCHIVED = "archived",
}

@Entity("tenants")
export class TenantEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  name: string

  @Column({ unique: true })
  slug: string

  @Column({
    type: "enum",
    enum: TenantStatus,
    default: TenantStatus.PENDING,
  })
  status: TenantStatus

  @Column({ nullable: true })
  description: string

  @Column({ default: false })
  isEnterprise: boolean

  @OneToOne(
    () => TenantConfigEntity,
    (config) => config.tenant,
    {
      cascade: true,
    },
  )
  config: TenantConfigEntity

  @OneToOne(
    () => TenantUsageEntity,
    (usage) => usage.tenant,
    {
      cascade: true,
    },
  )
  usage: TenantUsageEntity

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
