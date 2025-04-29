import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"

export enum VideoProvider {
  ZOOM = "zoom",
  TEAMS = "teams",
  GOOGLE_MEET = "google_meet",
  CUSTOM = "custom",
}

@Entity("video_conferences")
export class VideoConference {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty({ description: "Unique identifier for the video conference" })
  id: string

  @Column({ type: "enum", enum: VideoProvider })
  @ApiProperty({
    description: "Video conferencing provider",
    enum: VideoProvider,
  })
  provider: VideoProvider

  @Column()
  @ApiProperty({ description: "Meeting ID from the provider" })
  meetingId: string

  @Column()
  @ApiProperty({ description: "Join URL for the meeting" })
  joinUrl: string

  @Column({ nullable: true })
  @ApiProperty({ description: "Host key or password", required: false })
  hostKey?: string

  @Column({ nullable: true })
  @ApiProperty({ description: "Participant password", required: false })
  participantPassword?: string

  @Column({ type: "json", nullable: true })
  @ApiProperty({ description: "Additional provider-specific settings", required: false })
  settings?: Record<string, any>

  @CreateDateColumn()
  @ApiProperty({ description: "When the record was created" })
  createdAt: Date

  @UpdateDateColumn()
  @ApiProperty({ description: "When the record was last updated" })
  updatedAt: Date
}
