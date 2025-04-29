import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { Registration } from "./registration.entity"

@Entity("enrollment_periods")
export class EnrollmentPeriod {
  @ApiProperty({ description: "Unique identifier for the enrollment period" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "Name of the enrollment period" })
  @Column()
  name: string

  @ApiProperty({ description: "Description of the enrollment period" })
  @Column({ nullable: true })
  description: string

  @ApiProperty({ description: "Start date of the enrollment period" })
  @Column({ type: "timestamp" })
  startDate: Date

  @ApiProperty({ description: "End date of the enrollment period" })
  @Column({ type: "timestamp" })
  endDate: Date

  @ApiProperty({ description: "Academic term associated with this enrollment period" })
  @Column()
  academicTerm: string

  @ApiProperty({ description: "Academic year associated with this enrollment period" })
  @Column()
  academicYear: string

  @ApiProperty({ description: "Whether the enrollment period is active" })
  @Column({ default: false })
  isActive: boolean

  @ApiProperty({ description: "Priority level for this enrollment period (lower numbers have higher priority)" })
  @Column({ default: 0 })
  priorityLevel: number

  @ApiProperty({ description: 'Student types eligible for this enrollment period (e.g., "undergraduate", "graduate")' })
  @Column("simple-array", { nullable: true })
  eligibleStudentTypes: string[]

  @ApiProperty({ description: "Maximum credits allowed for registration during this period" })
  @Column({ nullable: true })
  maxCredits: number

  @OneToMany(
    () => Registration,
    (registration) => registration.enrollmentPeriod,
  )
  registrations: Registration[]

  @ApiProperty({ description: "Date when the record was created" })
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty({ description: "Date when the record was last updated" })
  @UpdateDateColumn()
  updatedAt: Date
}
