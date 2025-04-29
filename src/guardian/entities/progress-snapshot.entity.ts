import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"

@Entity("progress_snapshots")
export class ProgressSnapshot {
  @ApiProperty({ description: "The unique identifier of the progress snapshot" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "The student ID this progress belongs to" })
  @Column()
  studentId: string

  @ApiProperty({ description: "The course or subject ID" })
  @Column()
  courseId: string

  @ApiProperty({ description: "The current progress percentage" })
  @Column({ type: "float" })
  progressPercentage: number

  @ApiProperty({ description: "The current grade or score" })
  @Column({ nullable: true })
  currentGrade: string

  @ApiProperty({ description: "Additional progress details as JSON" })
  @Column({ type: "jsonb", nullable: true })
  progressDetails: Record<string, any>

  @ApiProperty({ description: "When the snapshot was taken" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  snapshotDate: Date

  @ApiProperty({ description: "When the snapshot was created" })
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date
}
