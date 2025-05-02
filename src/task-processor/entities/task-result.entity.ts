import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TaskEntity } from './task.entity';

@Entity('task_results')
export class TaskResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  taskId: string;

  @ManyToOne(() => TaskEntity, task => task.results)
  @JoinColumn({ name: 'taskId' })
  task: TaskEntity;

  @Column({ type: 'json', nullable: true })
  result: any;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ nullable: true })
  processingTime: number;

  @CreateDateColumn()
  createdAt: Date;
}