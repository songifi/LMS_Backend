import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LtiUserEntity } from './lti-user.entity';
import { LtiResourceLinkEntity } from './lti-resource-link.entity';

/**
 * Represents an LTI launch session
 */
@Entity('lti_sessions')
export class LtiEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  nonce: string;
  
  @Column('text')
  state: string;
  
  @Column({ length: 255 })
  messageType: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @ManyToOne(() => LtiUserEntity)
  @JoinColumn({ name: 'user_id' })
  user: LtiUserEntity;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => LtiResourceLinkEntity, { nullable: true })
  @JoinColumn({ name: 'resource_link_id' })
  resourceLink: LtiResourceLinkEntity;

  @Column({ name: 'resource_link_id', nullable: true })
  resourceLinkId: string;

  @Column('text', { nullable: true })
  targetLinkUri: string;

  @Column('json', { nullable: true })
  ltiMessage: Record<string, any>;

  @Column('json', { nullable: true })
  deepLinkingSettings: Record<string, any>;

  @Column({ default: false })
  isProcessed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}