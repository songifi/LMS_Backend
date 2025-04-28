import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
  } from "typeorm"
import { NotificationDelivery } from "./notification-delivery.entity"
import { NotificationType } from "./notification-type.entity"
import { NotificationPriority } from "../enums/notificationPriority.enum"
import { NotificationStatus } from "../enums/notificationStatus.enum"
  
  @Entity("notifications")
  export class Notification {
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @Column()
    userId: string
  
    @ManyToOne(() => NotificationType)
    @JoinColumn({ name: "typeId" })
    type: NotificationType
  
    @Column()
    typeId: string
  
    @Column("text")
    title: string
  
    @Column("text")
    message: string
  
    @Column({ type: "jsonb", nullable: true })
    data: Record<string, any>
  
    @Column({
      type: "enum",
      enum: NotificationPriority,
      default: NotificationPriority.MEDIUM,
    })
    priority: NotificationPriority
  
    @Column({
      type: "enum",
      enum: NotificationStatus,
      default: NotificationStatus.PENDING,
    })
    status: NotificationStatus
  
    @Column({ default: false })
    isRead: boolean
  
    @Column({ nullable: true })
    readAt: Date
  
    @CreateDateColumn()
    createdAt: Date
  
    @UpdateDateColumn()
    updatedAt: Date
  
    @Column({ nullable: true })
    expiresAt: Date
  
    @OneToMany(
      () => NotificationDelivery,
      (delivery) => delivery.notification,
    )
    deliveries: NotificationDelivery[]
  }
  