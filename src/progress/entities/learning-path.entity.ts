import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProgressTracker } from './progress-tracker.entity';

@Entity()
export class LearningPath {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => ProgressTracker, tracker => tracker.learningPath)
  progressTrackers: ProgressTracker[];
}
