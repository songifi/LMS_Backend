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
  import { Order } from "./order.entity"
  
  export enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
  }
  
  export enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    PAYPAL = "paypal",
    BANK_TRANSFER = "bank_transfer",
    CRYPTO = "crypto",
  }
  
  @Entity("payments")
  export class Payment {
    @ApiProperty({ description: "Unique identifier for the payment" })
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @ApiProperty({ description: "Order ID associated with the payment" })
    @Column()
    orderId: string
  
    @ManyToOne(() => Order)
    @JoinColumn({ name: "orderId" })
    order: Order
  
    @ApiProperty({ description: "Amount of the payment in cents" })
    @Column()
    amount: number
  
    @ApiProperty({ description: "Status of the payment" })
    @Column({
      type: "enum",
      enum: PaymentStatus,
      default: PaymentStatus.PENDING,
    })
    status: PaymentStatus
  
    @ApiProperty({ description: "Payment method used" })
    @Column({
      type: "enum",
      enum: PaymentMethod,
    })
    method: PaymentMethod
  
    @ApiProperty({ description: "External payment provider transaction ID" })
    @Column({ nullable: true })
    transactionId: string
  
    @ApiProperty({ description: "Date when the payment was created" })
    @CreateDateColumn()
    createdAt: Date
  
    @ApiProperty({ description: "Date when the payment was last updated" })
    @UpdateDateColumn()
    updatedAt: Date
  }
  