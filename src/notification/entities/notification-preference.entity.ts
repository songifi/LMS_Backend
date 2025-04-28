import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
  } from "typeorm"
  import { NotificationType } from "./notification-type.entity"
  import { DeliveryChannel } from "./notification-template.entity"
  
  @Entity("notification_preferences")
  @Unique(["userId", "typeId", "channel"])
  export class NotificationPreference {
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @Column()
    userId: string
  
    @ManyToOne(() => NotificationType)
    @JoinColumn({ name: "typeId" })
    type: NotificationType
  
    @Column()
    typeId: string
  
    @Column({
      type: "enum",
      enum: DeliveryChannel,
    })
    channel: DeliveryChannel
  
    @Column({ default: true })
    enabled: boolean
  
    @CreateDateColumn()
    createdAt: Date
  
    @UpdateDateColumn()
    updatedAt: Date
  }
  