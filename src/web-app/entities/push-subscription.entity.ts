import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('push_subscriptions')
export class PushSubscription {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'varchar', length: 500 })
  endpoint: string;
  
  @Column({ type: 'varchar', length: 500 })
  p256dh: string;
  
  @Column({ type: 'varchar', length: 500 })
  auth: string;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
  
  @Column({ type: 'timestamp' })
  createdAt: Date;
  
  @Column({ type: 'timestamp' })
  updatedAt: Date;
}