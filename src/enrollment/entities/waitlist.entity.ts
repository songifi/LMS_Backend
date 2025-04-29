import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { WaitlistPosition } from "./waitlist-position.entity"

@Entity("waitlists")
export class Waitlist {
  @ApiProperty({ description: "Unique identifier for the waitlist" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "Course ID associated with this waitlist" })
  @Column()
  courseId: string

  @ApiProperty({ description: "Section ID associated with this waitlist" })
  @Column({ nullable: true })
  sectionId: string

  @ApiProperty({ description: "Semester ID associated with this waitlist" })
  @Column()
  semesterId: string

  @ApiProperty({ description: "Maximum capacity of the waitlist" })
  @Column({ default: 50 })
  maxCapacity: number

  @ApiProperty({ description: "Current count of students on the waitlist" })
  @Column({ default: 0 })
  currentCount: number

  @ApiProperty({ description: "Whether the waitlist is active" })
  @Column({ default: true })
  isActive: boolean

  @ApiProperty({ description: "Whether automatic enrollment from waitlist is enabled" })
  @Column({ default: true })
  autoEnrollEnabled: boolean

  @OneToMany(
    () => WaitlistPosition,
    (position) => position.waitlist,
  )
  positions: WaitlistPosition[]

  @ApiProperty({ description: "Date when the record was created" })
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty({ description: "Date when the record was last updated" })
  @UpdateDateColumn()
  updatedAt: Date
}
