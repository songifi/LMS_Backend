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
 * Represents an LTI tool that our system can provide
 */
@Entity('lti_tools')
export class LtiToolEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  clientId: string;

  @Column({ length: 255 })
  issuer: string;

  @Column('text')
  publicKey: string;

  @Column('text')
  privateKey: string;

  @Column('text', { nullable: true })
  publicJwk: string;

  @Column({ length: 2048 })
  loginUrl: string;

  @Column({ length: 2048 })
  redirectUrl: string;

  @Column({ length: 2048, nullable: true })
  deepLinkingUrl: string;

  @Column({ default: true })
  supportsDeepLinking: boolean;

  @Column({ default: true })
  supportsAgs: boolean;  // Assignment and Grade Services

  @Column({ default: true })
  supportsNrps: boolean;  // Names and Roles Provisioning Service

  @Column({ default: true })
  isActive: boolean;

  @Column('json', { nullable: true })
  customParameters: Record<string, string>;

  @OneToMany(() => LtiDeploymentEntity, deployment => deployment.tool)
  deployments: LtiDeploymentEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}