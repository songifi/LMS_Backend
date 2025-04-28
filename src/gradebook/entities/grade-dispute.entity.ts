import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { User } from "src/user/entities/user.entity"
import { GradebookEntry } from "./gradebook-entry.entity"

@Entity()
export class GradeDispute {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => GradebookEntry)
  gradebookEntry: GradebookEntry

  @ManyToOne(() => User)
  student: User

  @Column("text")
  reason: string

  @Column("text", { nullable: true })
  evidence: string

  @Column("enum", {
    enum: ["pending", "under_review", "approved", "rejected", "resolved"],
    default: "pending",
  })
  status: "pending" | "under_review" | "approved" | "rejected" | "resolved"

  @ManyToOne(() => User, { nullable: true })
  reviewedBy: User

  @Column("text", { nullable: true })
  resolution: string

  @Column("float", { nullable: true })
  proposedScore: number

  @Column({ nullable: true })
  proposedLetterGrade: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
