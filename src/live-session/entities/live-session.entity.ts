import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
    JoinColumn,
  } from "typeorm"
  import { ApiProperty } from "@nestjs/swagger"
  import { InteractiveTool } from "./interactive-tool.entity"
  import { LiveAttendance } from "./live-attendance.entity"
  import { LiveChat } from "./live-chat.entity"
  import { BreakoutRoom } from "./breakout-room.entity"
import { VideoConference } from "./video-conference.entity"
import { SessionRecording } from "./session-recording.entity"
  
  export enum SessionStatus {
    SCHEDULED = "scheduled",
    LIVE = "live",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
  }
  
  @Entity("live_sessions")
  export class LiveSession {
    @PrimaryGeneratedColumn("uuid")
    @ApiProperty({ description: "Unique identifier for the live session" })
    id: string
  
    @Column()
    @ApiProperty({ description: "Title of the live session" })
    title: string
  
    @Column({ type: "text", nullable: true })
    @ApiProperty({ description: "Description of the live session", required: false })
    description?: string
  
    @Column({ type: "timestamp" })
    @ApiProperty({ description: "Scheduled start time of the session" })
    scheduledStartTime: Date
  
    @Column({ type: "timestamp", nullable: true })
    @ApiProperty({ description: "Actual start time of the session", required: false })
    actualStartTime?: Date
  
    @Column({ type: "timestamp", nullable: true })
    @ApiProperty({ description: "End time of the session", required: false })
    endTime?: Date
  
    @Column({ type: "enum", enum: SessionStatus, default: SessionStatus.SCHEDULED })
    @ApiProperty({
      description: "Current status of the session",
      enum: SessionStatus,
      default: SessionStatus.SCHEDULED,
    })
    status: SessionStatus
  
    @Column({ type: "int", default: 0 })
    @ApiProperty({ description: "Maximum number of participants allowed", default: 0 })
    maxParticipants: number
  
    @Column({ default: false })
    @ApiProperty({ description: "Whether the session should be recorded", default: false })
    recordSession: boolean
  
    @OneToOne(() => VideoConference, { cascade: true, eager: true })
    @JoinColumn()
    @ApiProperty({ type: () => VideoConference })
    videoConference: VideoConference
  
    @OneToMany(
      () => InteractiveTool,
      (tool) => tool.liveSession,
    )
    @ApiProperty({ type: () => [InteractiveTool] })
    interactiveTools: InteractiveTool[]
  
    @OneToMany(
      () => LiveAttendance,
      (attendance) => attendance.liveSession,
    )
    @ApiProperty({ type: () => [LiveAttendance] })
    attendances: LiveAttendance[]
  
    @OneToMany(
      () => BreakoutRoom,
      (breakoutRoom) => breakoutRoom.liveSession,
    )
    @ApiProperty({ type: () => [BreakoutRoom] })
    breakoutRooms: BreakoutRoom[]
  
    @OneToOne(() => SessionRecording, { nullable: true })
    @JoinColumn()
    @ApiProperty({ type: () => SessionRecording, required: false })
    recording?: SessionRecording
  
    @OneToOne(() => LiveChat, { cascade: true })
    @JoinColumn()
    @ApiProperty({ type: () => LiveChat })
    liveChat: LiveChat
  
    @Column({ type: "uuid" })
    @ApiProperty({ description: "ID of the instructor/host" })
    hostId: string
  
    @CreateDateColumn()
    @ApiProperty({ description: "When the record was created" })
    createdAt: Date
  
    @UpdateDateColumn()
    @ApiProperty({ description: "When the record was last updated" })
    updatedAt: Date
  }
  