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
  import { Registration } from "./registration.entity"
  
  export enum ApprovalStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
  }
  
  export enum ApprovalType {
    PREREQUISITE_OVERRIDE = "prerequisite_override",
    CAPACITY_OVERRIDE = "capacity_override",
    INSTRUCTOR_APPROVAL = "instructor_approval",
    ADVISOR_APPROVAL = "advisor_approval",
    DEPARTMENT_APPROVAL = "department_approval",
  }
  
  @Entity("enrollment_approvals")
  export class EnrollmentApproval {
    @ApiProperty({ description: "Unique identifier for the enrollment approval" })
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @ApiProperty({ description: "Type of approval requested" })
    @Column({
      type: "enum",
      enum: ApprovalType,
    })
    approvalType: ApprovalType
  
    @ApiProperty({ description: "Current status of the approval" })
    @Column({
      type: "enum",
      enum: ApprovalStatus,
      default: ApprovalStatus.PENDING,
    })
    status: ApprovalStatus
  
    @ApiProperty({ description: "ID of the user who requested the approval" })
    @Column()
    requestedBy: string
  
    @ApiProperty({ description: "ID of the user who processed the approval" })
    @Column({ nullable: true })
    processedBy: string
  
    @ApiProperty({ description: "Date when the approval was requested" })
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    requestDate: Date
  
    @ApiProperty({ description: "Date when the approval was processed" })
    @Column({ type: "timestamp", nullable: true })
    processDate: Date
  
    @ApiProperty({ description: "Reason for requesting the approval" })
    @Column({ type: "text", nullable: true })
    requestReason: string
  
    @ApiProperty({ description: "Comments from the approver" })
    @Column({ type: "text", nullable: true })
    approverComments: string
  
    @ManyToOne(
      () => Registration,
      (registration) => registration.approvals,
    )
    @JoinColumn({ name: "registration_id" })
    registration: Registration
  
    @Column()
    registrationId: string
  
    @ApiProperty({ description: "Date when the record was created" })
    @CreateDateColumn()
    createdAt: Date
  
    @ApiProperty({ description: "Date when the record was last updated" })
    @UpdateDateColumn()
    updatedAt: Date
  }
  