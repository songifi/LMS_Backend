import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

@Entity()
export class SlowQuery {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  queryText: string

  @Column()
  executionTimeMs: number

  @Column({ nullable: true })
  explainPlan: string

  @Column({ nullable: true })
  suggestedIndexes: string

  @Column({ nullable: true })
  tableName: string

  @CreateDateColumn()
  createdAt: Date
}
