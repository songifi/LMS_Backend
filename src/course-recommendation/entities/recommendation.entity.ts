import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../../students/entities/student.entity';
import { Course } from '../../../courses/entities/course.entity';

@Entity('recommendations')
export class Recommendation {
  @ApiProperty({ description: 'Unique identifier for the recommendation' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Student receiving the recommendation' })
  @ManyToOne(() => Student, student => student.recommendations)
  student: Student;

  @ApiProperty({ description: 'Recommended course' })
  @ManyToOne(() => Course)
  course: Course;

  @ApiProperty({ description: 'Score or confidence of the recommendation (0-100)' })
  @Column('float')
  score: number;

  @ApiProperty({ description: 'Explanation for why this course was recommended' })
  @Column('text')
  explanation: string;

  @ApiProperty({ description: 'Algorithm ID used to generate this recommendation' })
  @Column()
  algorithmId: string;

  @ApiProperty({ description: 'Algorithm version used' })
  @Column()
  algorithmVersion: string;

  @ApiProperty({ description: 'Factors that influenced this recommendation (JSON)' })
  @Column('jsonb')
  factors: Record<string, any>;

  @ApiProperty({ description: 'Whether the student selected this recommendation' })
  @Column('boolean', { default: false })
  selected: boolean;

  @ApiProperty({ description: 'When the recommendation was generated' })
  @CreateDateColumn()
  createdAt: Date;
}