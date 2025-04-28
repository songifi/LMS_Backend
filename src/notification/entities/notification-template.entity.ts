import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from "typeorm"
  import { NotificationType } from "./notification-type.entity"
  
  export enum DeliveryChannel {
    IN_APP = "IN_APP",
    EMAIL = "EMAIL",
    PUSH = "PUSH",
    SMS = "SMS",
  }
  
  @Entity("notification_templates")
  export class NotificationTemplate {
    @PrimaryGeneratedColumn("uuid")
    id: string
  
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
  
    @Column()
    title: string
  
    @Column("text")
    template: string
  
    @Column({ default: true })
    isActive: boolean
  
    @CreateDateColumn()
    createdAt: Date
  
    @UpdateDateColumn()
    updatedAt: Date
  }
  