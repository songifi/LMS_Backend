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
import { LtiPlatformEntity } from './lti-platform.entity';
import { LtiToolEntity } from './lti-tool.entity';
import { LtiContextEntity } from './lti-context.entity';

/**
 * Represents a specific deployment of an LTI tool on a platform
 */
@Entity('lti_deployments')
export class LtiDeploymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  deploymentId: string;

  @ManyToOne(() => LtiPlatformEntity, platform => platform.deployments)
  @JoinColumn({ name: 'platform_id' })
  platform: LtiPlatformEntity;

  @Column({ name: 'platform_id' })
  platformId: string;

  @ManyToOne(() => LtiToolEntity, tool => tool.deployments, { nullable: true })
  @JoinColumn({ name: 'tool_id' })
  tool: LtiToolEntity;

  @Column({ name: 'tool_id', nullable: true })
  toolId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('json', { nullable: true })
  customParameters: Record<string, string>;

  @OneToMany(() => LtiContextEntity, context => context.deployment)
  contexts: LtiContextEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}