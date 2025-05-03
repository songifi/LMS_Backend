import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { LtiDeploymentEntity } from './lti-deployment.entity';
import { LtiResourceLinkEntity } from './lti-resource-link.entity';

/**
 * Represents an LTI context (course, group, etc.)
 */
@Entity('lti_contexts')
export class LtiContextEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  contextId: string;

  @Column({ length: 255, nullable: true })
  label: string;

  @Column({ length: 255, nullable: true })
  title: string;

  @Column('text', { nullable: true })
  type: string; // Could be a comma-separated list of types

  @ManyToOne(() => LtiDeploymentEntity, deployment => deployment.contexts)
  @JoinColumn({ name: 'deployment_id' })
  deployment: LtiDeploymentEntity;

  @Column({ name: 'deployment_id' })
  deploymentId: string;

  @Column('json', { nullable: true })
  customProperties: Record<string, string>;

  @OneToMany(() => LtiResourceLinkEntity, resourceLink => resourceLink.context)
  resourceLinks: LtiResourceLinkEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}