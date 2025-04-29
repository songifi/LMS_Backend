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
  
  export enum ToolType {
    POLL = "poll",
    QA = "qa",
    WHITEBOARD = "whiteboard",
    QUIZ = "quiz",
  }
  
  @Entity("interactive_tools")
  export class InteractiveTool {
    @PrimaryGeneratedColumn("uuid")
    @ApiProperty({ description: "Unique identifier for the interactive tool" })
    id: string
  
    @Column({ type: "enum", enum: ToolType })
    @ApiProperty({
      description: "Type of interactive tool",
      enum: ToolType,
    })
    type: ToolType
  
    @Column()
    @ApiProperty({ description: "Title of the tool" })
    title: string
  
    @Column({ type: "json" })
    @ApiProperty({ description: "Configuration for the tool" })
    configuration: Record<string, any>
  
    @Column({ type: "json", nullable: true })
    @ApiProperty({ description: "Results/responses from the tool", required: false })
    results?: Record<string, any>
  
    @Column({ default: false })
    @ApiProperty({ description: "Whether the tool is currently active", default: false })
    isActive: boolean
  
    @ManyToOne(
      () => LiveSession,
      (liveSession) => liveSession.interactiveTools,
    )
    @JoinColumn({ name: "live_session_id" })
    liveSession: LiveSession
  
    @Column({ type: "uuid" })
    live_session_id: string
  
    @CreateDateColumn()
    @ApiProperty({ description: "When the record was created" })
    createdAt: Date
  
    @UpdateDateColumn()
    @ApiProperty({ description: "When the record was last updated" })
    updatedAt: Date
  }
  