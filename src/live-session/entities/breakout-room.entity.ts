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
  
  @Entity("breakout_rooms")
  export class BreakoutRoom {
    @PrimaryGeneratedColumn("uuid")
    @ApiProperty({ description: "Unique identifier for the breakout room" })
    id: string
  
    @Column()
    @ApiProperty({ description: "Name of the breakout room" })
    name: string
  
    @ManyToOne(
      () => LiveSession,
      (liveSession) => liveSession.breakoutRooms,
    )
    @JoinColumn({ name: "live_session_id" })
    liveSession: LiveSession
  
    @Column({ type: "uuid" })
    live_session_id: string
  
    @Column({ type: "json", default: "[]" })
    @ApiProperty({ description: "IDs of participants in this room" })
    participantIds: string[]
  
    @Column({ type: "uuid", nullable: true })
    @ApiProperty({ description: "ID of the facilitator for this room", required: false })
    facilitatorId?: string
  
    @Column({ type: "timestamp", nullable: true })
    @ApiProperty({ description: "When the breakout room started", required: false })
    startTime?: Date
  
    @Column({ type: "timestamp", nullable: true })
    @ApiProperty({ description: "When the breakout room ended", required: false })
    endTime?: Date
  
    @Column({ default: false })
    @ApiProperty({ description: "Whether the room is currently active", default: false })
    isActive: boolean
  
    @Column({ type: "json", nullable: true })
    @ApiProperty({ description: "Additional configuration for the room", required: false })
    configuration?: Record<string, any>
  
    @CreateDateColumn()
    @ApiProperty({ description: "When the record was created" })
    createdAt: Date
  
    @UpdateDateColumn()
    @ApiProperty({ description: "When the record was last updated" })
    updatedAt: Date
  }
  