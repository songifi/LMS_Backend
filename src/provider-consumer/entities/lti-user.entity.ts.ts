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
import { LtiDeploymentEntity } from './lti-deployment.entity';

/**
 * Represents an LTI user
 */
@Entity('lti_users')
@Index(['subjectId', 'deploymentId'], { unique: true })
export class LtiUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  subjectId: string;  // sub claim from LTI 1.3 JWT

  @ManyToOne(() => LtiDeploymentEntity)
  @JoinColumn({ name: 'deployment_id' })
  deployment: LtiDeploymentEntity;

  @Column({ name: 'deployment_id' })
  deploymentId: string;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column({ length: 255, nullable: true })
  givenName: string;

  @Column({ length: 255, nullable: true })
  familyName: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column('text', { nullable: true })
  locale: string;

  @Column('json', { nullable: true })
  roles: string[];

  @Column('json', { nullable: true })
  customProperties: Record<string, string>;

  @Column({ nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}