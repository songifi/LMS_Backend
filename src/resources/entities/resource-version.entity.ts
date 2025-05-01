import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
import { Resource } from "./resource.entity"
import { ApiProperty } from "@nestjs/swagger"

@Entity("resource_versions")
export class ResourceVersion {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column()
  versionNumber: number

  @ApiProperty()
  @Column()
  location: string

  @ApiProperty()
  @Column({ type: "bigint", nullable: true })
  size: number

  @ApiProperty()
  @Column({ type: "text", nullable: true })
  changeNotes: string

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty({ type: () => Resource })
  @ManyToOne(() => Resource, (resource) => resource.versions)
  resource: Resource
}
