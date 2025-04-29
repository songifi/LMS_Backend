import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Program } from './academic-program.entity';
import { CourseSequence } from './course-sequence.entity';
import { CurriculumVersion } from './curriculum-version.entity';

@Entity('curricula')
export class Curriculum {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the curriculum' })
  id: string;

  @Column({ length: 100 })
  @ApiProperty({ description: 'Name of the curriculum' })
  name: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Curriculum description' })
  description: string;

  @Column()
  @ApiProperty({ description: 'Academic year this curriculum is for' })
  academicYear: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Whether this is the current curriculum' })
  isActive: boolean;

  @Column()
  @ApiProperty({ description: 'Total credits in this curriculum' })
  totalCredits: number;

  @ManyToOne(() => Program, program => program.curricula)
  @JoinColumn({ name: 'program_id' })
  @ApiProperty({ type: () => Program, description: 'Program this curriculum belongs to' })
  program: Program;

  @Column()
  programId: string;

  @OneToMany(() => CourseSequence, courseSequence => courseSequence.curriculum)
  @ApiProperty({ type: () => [CourseSequence], description: 'Course sequences in this curriculum' })
  courseSequences: CourseSequence[];

  @OneToMany(() => CurriculumVersion, version => version.curriculum)
  @ApiProperty({ type: () => [CurriculumVersion], description: 'Historical versions of this curriculum' })
  versions: CurriculumVersion[];

  @CreateDateColumn()
  @ApiProperty({ description: 'When the curriculum was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'When the curriculum was last updated' })
  updatedAt: Date;
}
