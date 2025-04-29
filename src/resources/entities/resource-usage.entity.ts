import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
import { Resource } from "./resource.entity"
import { ApiProperty } from "@nestjs/swagger"

@Entity("resource_usage")
export class ResourceUsage {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column()
  userId: string

  @ApiProperty()
  @Column()
  action: string

  @ApiProperty()
  @CreateDateColumn()
  timestamp: Date

  @ApiProperty()
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @ApiProperty({ type: () => Resource })
  @ManyToOne(() => Resource, (resource) => resource.usageStats)
  resource: Resource
}
