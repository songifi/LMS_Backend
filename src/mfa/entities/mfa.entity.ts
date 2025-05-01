import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MfaMethod } from '../enums/mfa-method.enum';
import { User } from '../../users/entities/user.entity';

@Entity('mfa')
export class MfaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: MfaMethod,
  })
  method: MfaMethod;

  @Column({ nullable: true })
  secret: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
