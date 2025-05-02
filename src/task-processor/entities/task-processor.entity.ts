import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TaskResultEntity } from './task-result.entity';
import { TaskType } from '../enums/taskType.enum';
import { TaskStatus } from '../enums/taskStatus.enum';
import { TaskPriority } from '../enums/taskPriority.enum';

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TaskType,
    default: TaskType.GRADING,
  })
  type: TaskType;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ nullable: true })
  jobId: string;

  @Column({ nullable: true })
  queueName: string;

  @Column({ nullable: true })
  error: string;

  @Column({ default: 0 })
  attempts: number;

  @Column({ nullable: true })
  scheduledFor: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TaskResultEntity, result => result.task)
  results: TaskResultEntity[];
}
