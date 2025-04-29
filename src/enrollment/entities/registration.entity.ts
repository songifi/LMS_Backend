import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm"
  import { ApiProperty } from "@nestjs/swagger"
  import { EnrollmentPeriod } from "./enrollment-period.entity"
import { RegistrationHistory } from "./registration-history.entity"
import { EnrollmentPayment } from "./enrollment-payment.entity"
import { EnrollmentApproval } from "./enrollment-approval.entity"
import { RegistrationStatus } from "../enums/registrationStatus.enum"
  
  @Entity("registrations")
  export class Registration {
    @ApiProperty({ description: "Unique identifier for the registration" })
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @ApiProperty({ description: "Student ID associated with this registration" })
    @Column()
    studentId: string
  
    @ApiProperty({ description: "Course ID associated with this registration" })
    @Column()
    courseId: string
  
    @ApiProperty({ description: "Section ID associated with this registration" })
    @Column({ nullable: true })
    sectionId: string
  
    @ApiProperty({ description: "Program ID associated with this registration" })
    @Column({ nullable: true })
    programId: string
  
    @ApiProperty({ description: "Semester ID associated with this registration" })
    @Column()
    semesterId: string
  
    @ApiProperty({ description: "Current status of the registration" })
    @Column({
      type: "enum",
      enum: RegistrationStatus,
      default: RegistrationStatus.PENDING,
    })
    status: RegistrationStatus
  
    @ApiProperty({ description: "Number of credits for this registration" })
    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    credits: number
  
    @ApiProperty({ description: "Registration date" })
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    registrationDate: Date
  
    @ApiProperty({ description: "Whether prerequisites have been verified" })
    @Column({ default: false })
    prerequisitesVerified: boolean
  
    @ApiProperty({ description: "Notes related to this registration" })
    @Column({ type: "text", nullable: true })
    notes: string
  
    @ManyToOne(
      () => EnrollmentPeriod,
      (enrollmentPeriod) => enrollmentPeriod.registrations,
    )
    @JoinColumn({ name: "enrollment_period_id" })
    enrollmentPeriod: EnrollmentPeriod
  
    @Column()
    enrollmentPeriodId: string
  
    @OneToMany(
      () => RegistrationHistory,
      (history) => history.registration,
    )
    history: RegistrationHistory[]
  
    @OneToMany(
      () => EnrollmentPayment,
      (payment) => payment.registration,
    )
    payments: EnrollmentPayment[]
  
    @OneToMany(
      () => EnrollmentApproval,
      (approval) => approval.registration,
    )
    approvals: EnrollmentApproval[]
  
    @ApiProperty({ description: "Date when the record was created" })
    @CreateDateColumn()
    createdAt: Date
  
    @ApiProperty({ description: "Date when the record was last updated" })
    @UpdateDateColumn()
    updatedAt: Date
  }
  