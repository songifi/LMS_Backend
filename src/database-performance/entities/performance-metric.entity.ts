import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

@Entity()
export class PerformanceMetric {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  queryName: string

  @Column()
  executionTimeMs: number

  @Column({ nullable: true })
  queryText: string

  @Column()
  concurrentUsers: number

  @Column({ default: false })
  isCached: boolean

  @Column({ nullable: true })
  indexesUsed: string

  @Column({ nullable: true })
  tableName: string

  @Column({ nullable: true })
  operationType: string // SELECT, INSERT, UPDATE, DELETE

  @CreateDateColumn()
  createdAt: Date
}
