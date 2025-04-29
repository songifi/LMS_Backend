import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { Achievement } from 'src/progress/entities/achievement.entity';
import { Badge } from 'src/progress/entities/badge.entity';
import { Goal } from 'src/progress/entities/goal.entity';
import { ProgressReport } from 'src/progress/entities/progress-report.entity';
import { ProgressTracker } from 'src/progress/entities/progress-tracker.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  facultyAffiliation: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  // Relations
  @OneToMany(() => Achievement, achievement => achievement.student)
  achievements: Achievement[];

  @OneToMany(() => Badge, badge => badge.student)
  badges: Badge[];

  @OneToMany(() => Goal, goal => goal.student)
  goals: Goal[];

  @OneToMany(() => ProgressReport, report => report.student)
  progressReports: ProgressReport[];

  @OneToMany(() => ProgressTracker, tracker => tracker.student)
  progressTrackers: ProgressTracker[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}