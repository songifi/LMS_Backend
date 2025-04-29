import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from "typeorm"
  import { ApiProperty } from "@nestjs/swagger"
  import { Product } from "./product.entity"
  
  export enum SubscriptionStatus {
    ACTIVE = "active",
    CANCELED = "canceled",
    EXPIRED = "expired",
    PENDING = "pending",
  }
  
  export enum BillingPeriod {
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    ANNUAL = "annual",
  }
  
  @Entity("subscriptions")
  export class Subscription {
    @ApiProperty({ description: "Unique identifier for the subscription" })
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @ApiProperty({ description: "User ID who owns the subscription" })
    @Column()
    userId: string
  
    @ApiProperty({ description: "Product ID associated with the subscription" })
    @Column()
    productId: string
  
    @ManyToOne(() => Product)
    @JoinColumn({ name: "productId" })
    product: Product
  
    @ApiProperty({ description: "Status of the subscription" })
    @Column({
      type: "enum",
      enum: SubscriptionStatus,
      default: SubscriptionStatus.PENDING,
    })
    status: SubscriptionStatus
  
    @ApiProperty({ description: "Billing period for the subscription" })
    @Column({
      type: "enum",
      enum: BillingPeriod,
      default: BillingPeriod.MONTHLY,
    })
    billingPeriod: BillingPeriod
  
    @ApiProperty({ description: "Price of the subscription in cents" })
    @Column()
    price: number
  
    @ApiProperty({ description: "Start date of the subscription" })
    @Column()
    startDate: Date
  
    @ApiProperty({ description: "End date of the subscription" })
    @Column({ nullable: true })
    endDate: Date
  
    @ApiProperty({ description: "Next billing date for the subscription" })
    @Column()
    nextBillingDate: Date
  
    @ApiProperty({ description: "External payment provider subscription ID" })
    @Column({ nullable: true })
    externalSubscriptionId: string
  
    @ApiProperty({ description: "Date when the subscription was created" })
    @CreateDateColumn()
    createdAt: Date
  
    @ApiProperty({ description: "Date when the subscription was last updated" })
    @UpdateDateColumn()
    updatedAt: Date
  }
  