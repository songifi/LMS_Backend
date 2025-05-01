import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DegreeProgram } from './degree-program.entity';
import { Course } from '../../courses/entities/course.entity';

export enum RequirementType {
  CORE = 'core',
  ELECTIVE = 'elective',
  CONCENTRATION = 'concentration',
  GENERAL_EDUCATION = 'general_education',
  CAPSTONE = 'capstone',
}

@Entity('degree_requirements')
export class DegreeRequirement {
  @ApiProperty({ description: 'Unique identifier for the degree requirement' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the requirement' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Description of the requirement' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Type of requirement' })
  @Column({
    type: 'enum',
    enum: RequirementType,
  })
  type: RequirementType;

  @ApiProperty({ description: 'Minimum credits required for this requirement' })
  @Column('int')
  minCredits: number;

  @ApiProperty({ description: 'Required GPA for this requirement (if applicable)' })
  @Column('float', { nullable: true })
  requiredGpa: number;

  @ApiProperty({ description: 'Minimum number of courses required (if applicable)' })
  @Column('int', { nullable: true })
  minCourses: number;

  @ApiProperty({ description: 'Degree program this requirement belongs to' })
  @ManyToOne(() => DegreeProgram, program => program.requirements)
  degreeProgram: DegreeProgram;

  @ManyToMany(() => Course, course => course.degreeRequirements)
  @JoinTable({
    name: 'requirement_courses',
    joinColumn: { name: 'requirement_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'course_id', referencedColumnName: 'id' },
  })
  courses: Course[];
}