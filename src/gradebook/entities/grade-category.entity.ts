import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm"
import { GradebookEntry } from "./gradebook-entry.entity"
  
  @Entity()
  export class GradeCategory {
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @Column()
    name: string
  
    @Column({ type: "text", nullable: true })
    description: string
  
    @Column("float")
    weight: number
  
    @Column({ default: true })
    isActive: boolean
  
    @OneToMany(
      () => GradeCategory,
      (category) => category.parent,
      { nullable: true },
    )
    children: GradeCategory[]
  
    @ManyToOne(
      () => GradeCategory,
      (category) => category.children,
      { nullable: true },
    )
    parent: GradeCategory
  
    @OneToMany(
      () => GradebookEntry,
      (entry) => entry.category,
    )
    entries: GradebookEntry[]
  
    @Column({ default: 0 })
    displayOrder: number
  
    @Column({ default: false })
    dropLowest: boolean
  
    @Column({ default: 0 })
    numberOfLowestToDrops: number
  
    @CreateDateColumn()
    createdAt: Date
  
    @UpdateDateColumn()
    updatedAt: Date
  }
  