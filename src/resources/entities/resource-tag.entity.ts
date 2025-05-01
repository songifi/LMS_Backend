import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany } from "typeorm"
import { Resource } from "./resource.entity"
import { ApiProperty } from "@nestjs/swagger"

@Entity("resource_tags")
export class ResourceTag {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ unique: true })
  name: string

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty({ type: () => [Resource] })
  @ManyToMany(() => Resource, (resource) => resource.tags)
  resources: Resource[]
}
