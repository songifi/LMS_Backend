import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Curriculum } from './curriculum.entity';

@Entity('course_sequences')
export class CourseSequence {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the course sequence' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Course code' })
  courseCode: string;

  @Column()
  @ApiProperty({ description: 'Course name' })
  courseName: string;

  @Column()
  @ApiProperty({ description: 'Credits for this course' })
  credits: number;

  @Column()
  @ApiProperty({ description: 'Semester in which this course should be taken' })
  semester: number;

  @Column()
  @ApiProperty({ description: 'Year in which this course should be taken' })
  year: number;

  @Column({ type: 'simple-array', nullable: true })
  @ApiProperty({ description: 'Prerequisites for this course' })
  prerequisites: string[];

  @Column({ type: 'simple-array', nullable: true })
  @ApiProperty({ description: 'Corequisites for this course' })
  corequisites: string[];

  @Column({ default: false })
  @ApiProperty({ description: 'Whether this course is required' })
  isRequired: boolean;

  @ManyToOne(() => Curriculum, curriculum => curriculum.courseSequences)
  @JoinColumn({ name: 'curriculum_id' })
  @ApiProperty({ type: () => Curriculum, description: 'Curriculum this course sequence belongs to' })
  curriculum: Curriculum;

  @Column()
  curriculumId: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'When the course sequence was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'When the course sequence was last updated' })
  updatedAt: Date;
}
