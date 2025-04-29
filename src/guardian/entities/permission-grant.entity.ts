import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { GuardianRelationship } from "./guardian-relationship.entity"

@Entity("permission_grants")
export class PermissionGrant {
  @ApiProperty({ description: "The unique identifier of the permission grant" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "The relationship ID this permission belongs to" })
  @Column()
  relationshipId: string

  @ApiProperty({ description: "The permission type" })
  @Column()
  permissionType: string

  @ApiProperty({ description: "Whether the permission is granted" })
  @Column({ default: true })
  isGranted: boolean

  @ApiProperty({ description: "When the permission was created" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date

  @ApiProperty({ description: "When the permission was last updated" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date

  // Relationships
  @ManyToOne(
    () => GuardianRelationship,
    (relationship) => relationship.permissions,
  )
  relationship: GuardianRelationship
}
