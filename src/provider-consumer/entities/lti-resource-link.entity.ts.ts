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
import { LtiContextEntity } from './lti-context.entity';

/**
 * Represents an LTI resource link (an assignment, module, etc.)
 */
@Entity('lti_resource_links')
@Index(['resourceLinkId', 'contextId'], { unique: true })
export class LtiResourceLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  resourceLinkId: string;  // From LTI claims

  @Column({ length: 255, nullable: true })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @ManyToOne(() => LtiContextEntity, context => context.resourceLinks)
  @JoinColumn({ name: 'context_id' })
  context: LtiContextEntity;

  @Column({ name: 'context_id' })
  contextId: string;

  @Column({ nullable: true })
  lineitemUrl: string;  // For Assignment and Grade Services

  @Column({ nullable: true })
  scoreMaximum: number;

  @Column('json', { nullable: true })
  customProperties: Record<string, string>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}