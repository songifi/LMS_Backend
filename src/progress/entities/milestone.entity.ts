import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProgressTracker } from './progress-tracker.entity';

@Entity()
export class Milestone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: false })
  completed: boolean;

  @ManyToOne(() => ProgressTracker, progressTracker => progressTracker.milestones)
  progressTracker: ProgressTracker;
}
