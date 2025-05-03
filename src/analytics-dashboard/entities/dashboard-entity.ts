import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { DashboardWidget } from './dashboard-widget.entity';

@Entity('dashboards')
export class Dashboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'role_id', nullable: true })
  roleId: string;

  @Column({ default: false })
  isTemplate: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  layout: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @OneToMany(() => DashboardWidget, widget => widget.dashboard, { 
    cascade: true,
    eager: true 
  })
  widgets: DashboardWidget[];

  @Column({ name: 'last_accessed_at', type: 'timestamptz', nullable: true })
  lastAccessedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
