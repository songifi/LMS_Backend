import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"

@Entity("session_recordings")
export class SessionRecording {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty({ description: "Unique identifier for the recording" })
  id: string

  @Column({ type: "uuid" })
  @ApiProperty({ description: "ID of the associated live session" })
  liveSessionId: string

  @Column()
  @ApiProperty({ description: "URL to access the recording" })
  url: string

  @Column({ type: "int", default: 0 })
  @ApiProperty({ description: "Duration of the recording in seconds", default: 0 })
  durationSeconds: number

  @Column({ type: "timestamp" })
  @ApiProperty({ description: "When the recording started" })
  startTime: Date

  @Column({ type: "timestamp", nullable: true })
  @ApiProperty({ description: "When the recording ended", required: false })
  endTime?: Date

  @Column({ default: false })
  @ApiProperty({ description: "Whether processing is complete", default: false })
  processingComplete: boolean

  @Column({ nullable: true })
  @ApiProperty({ description: "File size in bytes", required: false })
  fileSizeBytes?: number

  @Column({ type: "json", default: "{}" })
  @ApiProperty({ description: "Additional metadata about the recording" })
  metadata: Record<string, any>

  @CreateDateColumn()
  @ApiProperty({ description: "When the record was created" })
  createdAt: Date

  @UpdateDateColumn()
  @ApiProperty({ description: "When the record was last updated" })
  updatedAt: Date
}
