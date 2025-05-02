import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Enrollment } from '../../students/entities/enrollment.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('int')
  credits: number;

  @Column({ nullable: true })
  department: string;

  @Column('simple-array', { nullable: true })
  prerequisites: string[];

  @Column('simple-array', { nullable: true })
  corequisites: string[];

  @Column({ type: 'json', nullable: true })
  degreeRequirements: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  topics: string[];

  @Column({ type: 'float', nullable: true })
  averageRating: number;

  @Column({ type: 'int', nullable: true })
  difficulty: number;

  @Column({ type: 'json', nullable: true })
  semestersOffered: string[];

  @OneToMany(() => Enrollment, enrollment => enrollment.course)
  enrollments: Enrollment[];

  @ManyToMany(() => Course)
  relatedCourses: Course[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}