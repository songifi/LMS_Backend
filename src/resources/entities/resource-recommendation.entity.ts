import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
import { Resource } from "./resource.entity"
import { ApiProperty } from "@nestjs/swagger"

@Entity("resource_recommendations")
export class ResourceRecommendation {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column()
  userId: string

  @ApiProperty()
  @Column({ type: "float" })
  score: number

  @ApiProperty()
  @Column({ type: "text", nullable: true })
  reason: string

  @ApiProperty()
  @Column({ default: false })
  viewed: boolean

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty({ type: () => Resource })
  @ManyToOne(() => Resource)
  resource: Resource
}
