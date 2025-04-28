import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Assessment } from "src/assessment/entities/assessment.entity"

@Entity()
export class GradeCurve {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column("enum", {
    enum: ["linear", "normal", "square_root", "custom"],
    default: "linear",
  })
  curveType: "linear" | "normal" | "square_root" | "custom"

  @Column("json", { nullable: true })
  curveParameters: {
    mean?: number
    standardDeviation?: number
    adjustment?: number
    customFormula?: string
    additionalParams?: Record<string, any>
  }

  @ManyToOne(() => Assessment, { nullable: true })
  assessment: Assessment

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
