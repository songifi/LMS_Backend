import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
  } from "typeorm"
  import { ApiProperty } from "@nestjs/swagger"
  import { LiveSession } from "./live-session.entity"
  
  @Entity("live_attendances")
  export class LiveAttendance {
    @PrimaryGeneratedColumn("uuid")
    @ApiProperty({ description: "Unique identifier for the attendance record" })
    id: string
  
    @Column({ type: "uuid" })
    @ApiProperty({ description: "ID of the participant" })
    participantId: string
  
    @ManyToOne(
      () => LiveSession,
      (liveSession) => liveSession.attendances,
    )
    @JoinColumn({ name: "live_session_id" })
    liveSession: LiveSession
  
    @Column({ type: "uuid" })
    live_session_id: string
  
    @Column({ type: "timestamp" })
    @ApiProperty({ description: "When the participant joined" })
    joinTime: Date
  
    @Column({ type: "timestamp", nullable: true })
    @ApiProperty({ description: "When the participant left", required: false })
    leaveTime?: Date
  
    @Column({ type: "int", default: 0 })
    @ApiProperty({ description: "Duration in seconds", default: 0 })
    durationSeconds: number
  
    @Column({ default: false })
    @ApiProperty({ description: "Whether the participant has their camera on", default: false })
    cameraOn: boolean
  
    @Column({ default: false })
    @ApiProperty({ description: "Whether the participant has their microphone on", default: false })
    microphoneOn: boolean
  
    @Column({ type: "json", default: "{}" })
    @ApiProperty({ description: "Additional attendance metadata" })
    metadata: Record<string, any>
  
    @CreateDateColumn()
    @ApiProperty({ description: "When the record was created" })
    createdAt: Date
  
    @UpdateDateColumn()
    @ApiProperty({ description: "When the record was last updated" })
    updatedAt: Date
  }
  