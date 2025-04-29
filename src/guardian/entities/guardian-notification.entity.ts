import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { Guardian } from "./guardian.entity"

@Entity("guardian_notifications")
export class GuardianNotification {
  @ApiProperty({ description: "The unique identifier of the notification" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "The guardian ID this notification is for" })
  @Column()
  guardianId: string

  @ApiProperty({ description: "The notification type" })
  @Column()
  notificationType: string

  @ApiProperty({ description: "The notification title" })
  @Column()
  title: string

  @ApiProperty({ description: "The notification message" })
  @Column({ type: "text" })
  message: string

  @ApiProperty({ description: "Whether the notification has been read" })
  @Column({ default: false })
  isRead: boolean

  @ApiProperty({ description: "When the notification was created" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date

  @ApiProperty({ description: "When the notification was read" })
  @Column({ type: "timestamp", nullable: true })
  readAt: Date

  // Relationships
  @ManyToOne(
    () => Guardian,
    (guardian) => guardian.notifications,
  )
  guardian: Guardian
}
