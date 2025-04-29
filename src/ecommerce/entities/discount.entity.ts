import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { Order } from "./order.entity"

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
}

@Entity("discounts")
export class Discount {
  @ApiProperty({ description: "Unique identifier for the discount" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "Code for the discount" })
  @Column({ unique: true })
  code: string

  @ApiProperty({ description: "Description of the discount" })
  @Column("text", { nullable: true })
  description: string

  @ApiProperty({ description: "Type of discount (percentage or fixed amount)" })
  @Column({
    type: "enum",
    enum: DiscountType,
    default: DiscountType.PERCENTAGE,
  })
  type: DiscountType

  @ApiProperty({ description: "Value of the discount (percentage or amount in cents)" })
  @Column()
  value: number

  @ApiProperty({ description: "Start date of the discount validity" })
  @Column()
  startDate: Date

  @ApiProperty({ description: "End date of the discount validity" })
  @Column({ nullable: true })
  endDate: Date

  @ApiProperty({ description: "Maximum number of times the discount can be used" })
  @Column({ nullable: true })
  maxUses: number

  @ApiProperty({ description: "Current number of times the discount has been used" })
  @Column({ default: 0 })
  usedCount: number

  @ApiProperty({ description: "Whether the discount is active" })
  @Column({ default: true })
  isActive: boolean

  @ApiProperty({ description: "Date when the discount was created" })
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty({ description: "Date when the discount was last updated" })
  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(
    () => Order,
    (order) => order.discount,
  )
  orders: Order[]
}
