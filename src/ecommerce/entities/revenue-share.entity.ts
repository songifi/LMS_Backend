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
  
  @Entity("revenue_shares")
  export class RevenueShare {
    @ApiProperty({ description: "Unique identifier for the revenue share" })
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @ApiProperty({ description: "Product ID associated with the revenue share" })
    @Column()
    productId: string
  
    @ManyToOne(() => Product)
    @JoinColumn({ name: "productId" })
    product: Product
  
    @ApiProperty({ description: "Instructor ID who receives the revenue share" })
    @Column()
    instructorId: string
  
    @ApiProperty({ description: "Percentage of revenue shared with the instructor" })
    @Column({ type: "decimal", precision: 5, scale: 2 })
    percentage: number
  
    @ApiProperty({ description: "Whether the revenue share is active" })
    @Column({ default: true })
    isActive: boolean
  
    @ApiProperty({ description: "Date when the revenue share was created" })
    @CreateDateColumn()
    createdAt: Date
  
    @ApiProperty({ description: "Date when the revenue share was last updated" })
    @UpdateDateColumn()
    updatedAt: Date
  }
  