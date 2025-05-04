import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { LtiDeploymentEntity } from './lti-deployment.entity';

/**
 * Represents an LTI platform (LMS) that our system can interact with
 */
@Entity('lti_platforms')
export class LtiPlatformEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  issuer: string;

  @Column({ length: 2048 })
  authenticationEndpoint: string;

  @Column({ length: 2048 })
  accessTokenEndpoint: string;

  @Column({ length: 2048 })
  jwksEndpoint: string;

  @Column({ type: 'json', nullable: true })
  jwks: Record<string, any>;

  @Column({ length: 255, nullable: true })
  clientId: string;

  @Column('text', { nullable: true })
  authConfig: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastSyncDate: Date;

  @OneToMany(() => LtiDeploymentEntity, deployment => deployment.platform)
  deployments: LtiDeploymentEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}