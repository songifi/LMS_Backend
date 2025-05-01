import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MfaMethod } from '../enums/mfa-method.enum';

@Entity('mfa_config')
export class MfaConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  enforceMfa: boolean;

  @Column('simple-array')
  requiredRoles: string[];

  @Column({
    type: 'enum',
    enum: MfaMethod,
    array: true,
    default: [MfaMethod.TOTP],
  })
  allowedMethods: MfaMethod[];

  @Column({ default: 30 })
  totpStepSeconds: number;

  @Column({ default: 6 })
  totpDigits: number;

  @Column({ default: 'SHA1' })
  totpAlgorithm: string;

  @Column({ default: 10 })
  recoveryCodesCount: number;

  @Column({ default: true })
  allowUserToManageMfa: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
