import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm"
import { User } from "src/user/entities/user.entity"
import { GradebookEntry } from "./gradebook-entry.entity"

@Entity()
export class GradeHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => GradebookEntry)
  gradebookEntry: GradebookEntry

  @Column("float", { nullable: true })
  previousRawScore: number

  @Column("float", { nullable: true })
  newRawScore: number

  @Column("float", { nullable: true })
  previousAdjustedScore: number

  @Column("float", { nullable: true })
  newAdjustedScore: number

  @Column({ nullable: true })
  previousLetterGrade: string

  @Column({ nullable: true })
  newLetterGrade: string

  @Column("text", { nullable: true })
  reason: string

  @ManyToOne(() => User)
  modifiedBy: User

  @Column("json", { nullable: true })
  additionalChanges: Record<string, any>

  @CreateDateColumn()
  createdAt: Date
}
