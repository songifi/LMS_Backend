import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { Guardian } from "./guardian.entity"
import { PermissionGrant } from "./permission-grant.entity"

// We'll assume Student entity exists in another module
// This is a simplified reference to it
@Entity("guardian_relationships")
export class GuardianRelationship {
  @ApiProperty({ description: "The unique identifier of the relationship" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "The guardian ID" })
  @Column()
  guardianId: string

  @ApiProperty({ description: "The student ID" })
  @Column()
  studentId: string

  @ApiProperty({ description: "The relationship type (e.g., parent, legal guardian)" })
  @Column()
  relationshipType: string

  @ApiProperty({ description: "Whether the relationship is verified" })
  @Column({ default: false })
  isVerified: boolean

  @ApiProperty({ description: "Whether this is the primary guardian" })
  @Column({ default: false })
  isPrimary: boolean

  @ApiProperty({ description: "When the relationship was created" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date

  @ApiProperty({ description: "When the relationship was last updated" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date

  // Relationships
  @ManyToOne(
    () => Guardian,
    (guardian) => guardian.relationships,
  )
  guardian: Guardian

  @OneToMany(
    () => PermissionGrant,
    (permission) => permission.relationship,
  )
  permissions: PermissionGrant[]
}
