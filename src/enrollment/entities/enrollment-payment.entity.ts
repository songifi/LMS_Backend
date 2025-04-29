import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm"
  import { ApiProperty } from "@nestjs/swagger"
  import { Registration } from "./registration.entity"
  
  export enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
  }
  
  export enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    BANK_TRANSFER = "bank_transfer",
    SCHOLARSHIP = "scholarship",
    WAIVER = "waiver",
    OTHER = "other",
  }
  
  @Entity("enrollment_payments")
  export class EnrollmentPayment {
    @ApiProperty({ description: "Unique identifier for the enrollment payment" })
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @ApiProperty({ description: "Amount of the payment" })
    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount: number
  
    @ApiProperty({ description: "Currency of the payment" })
    @Column({ default: "USD" })
    currency: string
  
    @ApiProperty({ description: "Current status of the payment" })
    @Column({
      type: "enum",
      enum: PaymentStatus,
      default: PaymentStatus.PENDING,
    })
    status: PaymentStatus
  
    @ApiProperty({ description: "Method used for payment" })
    @Column({
      type: "enum",
      enum: PaymentMethod,
    })
    paymentMethod: PaymentMethod
  
    @ApiProperty({ description: "Transaction ID from the payment processor" })
    @Column({ nullable: true })
    transactionId: string
  
    @ApiProperty({ description: "Date when the payment was made" })
    @Column({ type: "timestamp", nullable: true })
    paymentDate: Date
  
    @ApiProperty({ description: "Notes related to this payment" })
    @Column({ type: "text", nullable: true })
    notes: string
  
    @ManyToOne(
      () => Registration,
      (registration) => registration.payments,
    )
    @JoinColumn({ name: "registration_id" })
    registration: Registration
  
    @Column()
    registrationId: string
  
    @ApiProperty({ description: "Date when the record was created" })
    @CreateDateColumn()
    createdAt: Date
  
    @ApiProperty({ description: "Date when the record was last updated" })
    @UpdateDateColumn()
    updatedAt: Date
  }
  