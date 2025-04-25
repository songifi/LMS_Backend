import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Content } from './content.entity';
import { AccessType } from '../enums/accessType.enum';

@Entity()
export class ContentAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Content, content => content.accessRules)
  content: Content;

  @Column({
    type: 'enum',
    enum: AccessType,
    default: AccessType.PUBLIC,
  })
  accessType: AccessType;

  @Column({ nullable: true })
  accessId: string; // User ID, Role ID, or Group ID

  @Column({ nullable: true })
  availableFrom: Date;

  @Column({ nullable: true })
  availableUntil: Date;

  @Column('jsonb', { nullable: true })
  conditions: any; // JSON object with conditional release rules

  @CreateDateColumn()
  createdAt: Date;
}