import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from "typeorm"
  import { Notification } from "./notification.entity"
  import { DeliveryChannel } from "./notification-template.entity"
  
  export enum DeliveryStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED",
  }
  
  @Entity("notification_deliveries")
  export class NotificationDelivery {
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @ManyToOne(
      () => Notification,
      (notification) => notification.deliveries,
    )
    @JoinColumn({ name: "notificationId" })
    notification: Notification
  
    @Column()
    notificationId: string
  
    @Column({
      type: "enum",
      enum: DeliveryChannel,
    })
    channel: DeliveryChannel
  
    @Column({
      type: "enum",
      enum: DeliveryStatus,
      default: DeliveryStatus.PENDING,
    })
    status: DeliveryStatus
  
    @Column({ nullable: true })
    externalId: string
  
    @Column("text", { nullable: true })
    errorMessage: string
  
    @Column({ nullable: true })
    sentAt: Date
  
    @Column({ nullable: true })
    deliveredAt: Date
  
    @CreateDateColumn()
    createdAt: Date
  
    @UpdateDateColumn()
    updatedAt: Date
  }
  