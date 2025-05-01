import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Resource } from './resource.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity("resource_access")
export class ResourceAccess {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column()
  principalId: string

  @ApiProperty()
  @Column()
  principalType: string

  @ApiProperty()
  @Column()
  permission: string

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty({ type: () => Resource })
  @ManyToOne(() => Resource, (resource) => resource.accessControls)
  resource: Resource
}