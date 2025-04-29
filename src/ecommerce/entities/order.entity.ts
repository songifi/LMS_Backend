import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
  } from "typeorm"
  import { ApiProperty } from "@nestjs/swagger"
  import { Product } from "./product.entity"
  import { Payment } from "./payment.entity"
  import { Discount } from "./discount.entity"
  
  export enum OrderStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    CANCELED = "canceled",
    REFUNDED = "refunded",
  }
  
  @Entity("orders")
  export class Order {
    @ApiProperty({ description: "Unique identifier for the order" })
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @ApiProperty({ description: "User ID who placed the order" })
    @Column()
    userId: string
  
    @ApiProperty({ description: "Product ID associated with the order" })
    @Column()
    productId: string
  
    @ManyToOne(() => Product)
    @JoinColumn({ name: "productId" })
    product: Product
  
    @ApiProperty({ description: "Status of the order" })
    @Column({
      type: "enum",
      enum: OrderStatus,
      default: OrderStatus.PENDING,
    })
    status: OrderStatus
  
    @ApiProperty({ description: "Original price of the order in cents" })
    @Column()
    originalPrice: number
  
    @ApiProperty({ description: "Final price after discounts in cents" })
    @Column()
    finalPrice: number
  
    @ApiProperty({ description: "Tax amount in cents" })
    @Column({ default: 0 })
    taxAmount: number
  
    @ApiProperty({ description: "Discount ID applied to the order" })
    @Column({ nullable: true })
    discountId: string | null

    @ManyToOne(() => Discount, { nullable: true })
    @JoinColumn({ name: "discountId" })
    discount: Discount
  
    @ApiProperty({ description: "Subscription ID associated with the order" })
    @Column({ nullable: true })
    subscriptionId: string
  
    @ApiProperty({ description: "Date when the order was created" })
    @CreateDateColumn()
    createdAt: Date
  
    @ApiProperty({ description: "Date when the order was last updated" })
    @UpdateDateColumn()
    updatedAt: Date
  
    @OneToMany(
      () => Payment,
      (payment) => payment.order,
    )
    payments: Payment[]
  }
  