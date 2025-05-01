import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
  } from "typeorm"
  import { Resource } from "./resource.entity"
  import { ApiProperty } from "@nestjs/swagger"
  
  @Entity("resource_categories")
export class ResourceCategory {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column()
  name: string

  @ApiProperty()
  @Column({ type: "text", nullable: true })
  description: string

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date

  @ApiProperty({ type: () => [Resource] })
  @OneToMany(() => Resource, (resource) => resource.category)
  resources: Resource[]

  @ApiProperty({ type: () => ResourceCategory, required: false })
  @ManyToOne(() => ResourceCategory, (category) => category.children, { nullable: true })
  parent: ResourceCategory

  @ApiProperty({ type: () => [ResourceCategory] })
  @OneToMany(() => ResourceCategory, (category) => category.parent)
  children: ResourceCategory[]
}
