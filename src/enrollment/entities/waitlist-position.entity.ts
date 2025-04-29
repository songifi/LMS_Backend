import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm"
  import { ApiProperty } from "@nestjs/swagger"
  import { Waitlist } from "./waitlist.entity"
  
  export enum WaitlistStatus {
    ACTIVE = "active",
    ENROLLED = "enrolled",
    EXPIRED = "expired",
    REMOVED = "removed",
  }
  
  @Entity("waitlist_positions")
  export class WaitlistPosition {
    @ApiProperty({ description: "Unique identifier for the waitlist position" })
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @ApiProperty({ description: "Student ID associated with this waitlist position" })
    @Column()
    studentId: string
  
    @ApiProperty({ description: "Position in the waitlist (lower numbers have higher priority)" })
    @Column()
    position: number
  
    @ApiProperty({ description: "Date when the student joined the waitlist" })
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    joinDate: Date
  
    @ApiProperty({ description: "Current status of the waitlist position" })
    @Column({
      type: "enum",
      enum: WaitlistStatus,
      default: WaitlistStatus.ACTIVE,
    })
    status: WaitlistStatus
  
    @ApiProperty({ description: "Date when the status was last updated" })
    @Column({ type: "timestamp", nullable: true })
    statusUpdatedDate: Date
  
    @ApiProperty({ description: "Notes related to this waitlist position" })
    @Column({ type: "text", nullable: true })
    notes: string
  
    @ManyToOne(
      () => Waitlist,
      (waitlist) => waitlist.positions,
    )
    @JoinColumn({ name: "waitlist_id" })
    waitlist: Waitlist
  
    @Column()
    waitlistId: string
  
    @ApiProperty({ description: "Date when the record was created" })
    @CreateDateColumn()
    createdAt: Date
  
    @ApiProperty({ description: "Date when the record was last updated" })
    @UpdateDateColumn()
    updatedAt: Date
  }
  