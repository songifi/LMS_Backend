import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
  } from "typeorm"
  import { ResourceCategory } from "./resource-category.entity"
  import { ResourceVersion } from "./resource-version.entity"
  import { ResourceTag } from "./resource-tag.entity"
  import { ResourceAccess } from "./resource-access.entity"
  import { ResourceUsage } from "./resource-usage.entity"
  import { ApiProperty } from "@nestjs/swagger"
  
  @Entity("resources")
export class Resource {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column()
  title: string

  @ApiProperty()
  @Column({ type: "text", nullable: true })
  description: string

  @ApiProperty()
  @Column()
  location: string

  @ApiProperty()
  @Column()
  mimeType: string

  @ApiProperty()
  @Column({ type: "bigint", nullable: true })
  size: number

  @ApiProperty()
  @Column({ default: false })
  isPublished: boolean

  @ApiProperty()
  @Column()
  author: string

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date

  @ApiProperty({ type: () => ResourceCategory })
  @ManyToOne(() => ResourceCategory, (category) => category.resources)
  category: ResourceCategory

  @ApiProperty({ type: () => [ResourceVersion] })
  @OneToMany(() => ResourceVersion, (version) => version.resource, { cascade: true })
  versions: ResourceVersion[]

  @ApiProperty({ type: () => [ResourceTag] })
  @ManyToMany(() => ResourceTag, (tag) => tag.resources)
  @JoinTable()
  tags: ResourceTag[]

  @ApiProperty({ type: () => [ResourceAccess] })
  @OneToMany(() => ResourceAccess, (access) => access.resource)
  accessControls: ResourceAccess[]

  @ApiProperty({ type: () => [ResourceUsage] })
  @OneToMany(() => ResourceUsage, (usage) => usage.resource)
  usageStats: ResourceUsage[]

  @ApiProperty()
  @Column({ default: 1 })
  currentVersion: number
}
