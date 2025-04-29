import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { GuardianRelationship } from "./guardian-relationship.entity"
import { GuardianMessage } from "./guardian-message.entity"
import { GuardianNotification } from "./guardian-notification.entity"
import { DependentGroup } from "./dependent-group.entity"

@Entity("guardians")
export class Guardian {
  @ApiProperty({ description: "The unique identifier of the guardian" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "First name of the guardian" })
  @Column()
  firstName: string

  @ApiProperty({ description: "Last name of the guardian" })
  @Column()
  lastName: string

  @ApiProperty({ description: "Email address of the guardian" })
  @Column({ unique: true })
  email: string

  @ApiProperty({ description: "Phone number of the guardian" })
  @Column({ nullable: true })
  phoneNumber: string

  @ApiProperty({ description: "Address of the guardian" })
  @Column({ nullable: true })
  address: string

  @ApiProperty({ description: "Whether the guardian account is verified" })
  @Column({ default: false })
  isVerified: boolean

  @ApiProperty({ description: "When the guardian account was created" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date

  @ApiProperty({ description: "When the guardian account was last updated" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date

  // Relationships
  @OneToMany(
    () => GuardianRelationship,
    (relationship) => relationship.guardian,
  )
  relationships: GuardianRelationship[]

  @OneToMany(
    () => GuardianMessage,
    (message) => message.guardian,
  )
  messages: GuardianMessage[]

  @OneToMany(
    () => GuardianNotification,
    (notification) => notification.guardian,
  )
  notifications: GuardianNotification[]

  @OneToMany(
    () => DependentGroup,
    (group) => group.guardian,
  )
  dependentGroups: DependentGroup[]
}
