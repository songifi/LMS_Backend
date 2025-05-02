import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class CacheConfig {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  queryPattern: string

  @Column()
  ttlSeconds: number

  @Column({ default: true })
  isEnabled: boolean

  @Column({ default: 0 })
  hitCount: number

  @Column({ default: 0 })
  missCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
