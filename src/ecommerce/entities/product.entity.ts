import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
  } from "typeorm"
  import { ApiProperty } from "@nestjs/swagger"
  import { Order } from "./order.entity"
  import { RevenueShare } from "./revenue-share.entity"
  
  export enum ProductType {
    COURSE = "course",
    BUNDLE = "bundle",
  }
  
  @Entity("products")
  export class Product {
    @ApiProperty({ description: "Unique identifier for the product" })
    @PrimaryGeneratedColumn("uuid")
    id: string
  
    @ApiProperty({ description: "Name of the product" })
    @Column()
    name: string
  
    @ApiProperty({ description: "Description of the product" })
    @Column("text")
    description: string
  
    @ApiProperty({ description: "Price of the product in cents" })
    @Column()
    price: number
  
    @ApiProperty({ description: "Type of product (course or bundle)" })
    @Column({
      type: "enum",
      enum: ProductType,
      default: ProductType.COURSE,
    })
    type: ProductType
  
    @ApiProperty({ description: "Whether the product is available for subscription" })
    @Column({ default: false })
    isSubscribable: boolean
  
    @ApiProperty({ description: "Whether the product is active" })
    @Column({ default: true })
    isActive: boolean
  
    @ApiProperty({ description: "Date when the product was created" })
    @CreateDateColumn()
    createdAt: Date
  
    @ApiProperty({ description: "Date when the product was last updated" })
    @UpdateDateColumn()
    updatedAt: Date
  
    @ManyToMany(() => Product)
    @JoinTable({
      name: "product_bundles",
      joinColumn: { name: "bundle_id", referencedColumnName: "id" },
      inverseJoinColumn: { name: "product_id", referencedColumnName: "id" },
    })
    bundledProducts: Product[]
  
    @OneToMany(
      () => Order,
      (order) => order.product,
    )
    orders: Order[]
  
    @OneToMany(
      () => RevenueShare,
      (revenueShare) => revenueShare.product,
    )
    revenueShares: RevenueShare[]
  }
  