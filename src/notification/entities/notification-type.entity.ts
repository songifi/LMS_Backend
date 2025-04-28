import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("notification_types")
export class NotificationType {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column()
  name: string

  @Column("text", { nullable: true })
  description: string

  @Column({ default: true })
  isActive: boolean

  @Column({ default: true })
  isDefault: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
