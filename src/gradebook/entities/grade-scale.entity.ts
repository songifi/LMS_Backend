import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class GradeScale {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column("json")
  scaleData: {
    letter: string
    lowerBound: number
    upperBound: number
    gpaValue?: number
  }[]

  @Column({ default: true })
  isActive: boolean

  @Column({ default: false })
  isDefault: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
