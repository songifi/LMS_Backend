import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm"
  import { User } from "src/user/entities/user.entity"
  import { Assessment } from "src/assessment/entities/assessment.entity"
  import { Grade } from "src/assessment/entities/grade.entity"
  import { GradeCategory } from "./grade-category.entity"
  import { GradeCurve } from "./grade-curve.entity"
import { GradeHistory } from "./grade-history.entity"
  
  @Entity()
  export class GradebookEntry {
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @ManyToOne(() => User)
    student: User
  
    @ManyToOne(() => Assessment, { nullable: true })
    assessment: Assessment
  
    @ManyToOne(() => Grade, { nullable: true })
    grade: Grade
  
    @ManyToOne(() => GradeCategory)
    category: GradeCategory
  
    @Column("float")
    rawScore: number
  
    @Column("float")
    possiblePoints: number
  
    @Column("float", { nullable: true })
    adjustedScore: number
  
    @Column("float", { nullable: true })
    weightedScore: number
  
    @Column("float", { nullable: true })
    percentage: number
  
    @Column({ nullable: true })
    letterGrade: string
  
    @ManyToOne(() => GradeCurve, { nullable: true })
    appliedCurve: GradeCurve
  
    @Column({ default: false })
    isExcused: boolean
  
    @Column({ default: false })
    isExtraCredit: boolean
  
    @Column({ type: "text", nullable: true })
    comments: string
  
    @OneToMany(
      () => GradeHistory,
      (history) => history.gradebookEntry,
    )
    history: GradeHistory[]
  
    @Column({ default: true })
    isPublished: boolean
  
    @CreateDateColumn()
    createdAt: Date
  
    @UpdateDateColumn()
    updatedAt: Date
  }
  