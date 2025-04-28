import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm"
  import { GradeScale } from "./grade-scale.entity"
  import { GradeCategory } from "./grade-category.entity"
  
  @Entity()
  export class Gradebook {
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @ManyToOne(() => GradeScale)
    gradeScale: GradeScale
  
    @Column({ default: true })
    isActive: boolean
  
    @Column({ default: false })
    allowDropLowest: boolean
  
    @Column({ default: false })
    showLetterGrades: boolean
  
    @Column({ default: true })
    showPercentages: boolean
  
    @Column({ default: false })
    allowExtraCredit: boolean
  
    @Column("float", { default: 100 })
    maxExtraCreditPercentage: number
  
    @Column({ default: false })
    isWeighted: boolean
  
    @CreateDateColumn()
    createdAt: Date
  
    @UpdateDateColumn()
    updatedAt: Date
  }
  