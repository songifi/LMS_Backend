import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Milestone } from './milestone.entity';
import { LearningPath } from './learning-path.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class ProgressTracker {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.progressTrackers)
  student: User;

  @OneToMany(() => Milestone, milestone => milestone.progressTracker)
  milestones: Milestone[];

    @ManyToOne(() => LearningPath, path => path.progressTrackers)
  learningPath: LearningPath;

  @Column({ type: 'float', default: 0 })
  overallProgress: number;
}
