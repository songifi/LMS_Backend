import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { Guardian } from "./guardian.entity"

@Entity("guardian_messages")
export class GuardianMessage {
  @ApiProperty({ description: "The unique identifier of the message" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "The guardian ID who sent/received the message" })
  @Column()
  guardianId: string

  @ApiProperty({ description: "The instructor ID who sent/received the message" })
  @Column()
  instructorId: string

  @ApiProperty({ description: "The student ID this message is about" })
  @Column()
  studentId: string

  @ApiProperty({ description: "The message subject" })
  @Column()
  subject: string

  @ApiProperty({ description: "The message content" })
  @Column({ type: "text" })
  content: string

  @ApiProperty({ description: "Whether the message was sent by the guardian" })
  @Column()
  sentByGuardian: boolean

  @ApiProperty({ description: "Whether the message has been read" })
  @Column({ default: false })
  isRead: boolean

  @ApiProperty({ description: "When the message was sent" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  sentAt: Date

  @ApiProperty({ description: "When the message was read" })
  @Column({ type: "timestamp", nullable: true })
  readAt: Date

  // Relationships
  @ManyToOne(
    () => Guardian,
    (guardian) => guardian.messages,
  )
  guardian: Guardian
}
