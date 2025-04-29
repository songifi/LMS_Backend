import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { Guardian } from "./guardian.entity"

@Entity("dependent_groups")
export class DependentGroup {
  @ApiProperty({ description: "The unique identifier of the dependent group" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "The guardian ID who owns this group" })
  @Column()
  guardianId: string

  @ApiProperty({ description: "The name of the group" })
  @Column()
  name: string

  @ApiProperty({ description: "The student IDs in this group" })
  @Column("text", { array: true })
  studentIds: string[]

  @ApiProperty({ description: "When the group was created" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date

  @ApiProperty({ description: "When the group was last updated" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date

  // Relationships
  @ManyToOne(
    () => Guardian,
    (guardian) => guardian.dependentGroups,
  )
  guardian: Guardian
}
