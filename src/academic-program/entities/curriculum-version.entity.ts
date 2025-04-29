import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Curriculum } from './curriculum.entity';

@Entity('curriculum_versions')
export class CurriculumVersion {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the curriculum version' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Version number' })
  versionNumber: number;

  @Column({ type: 'json' })
  @ApiProperty({ description: 'Snapshot of the curriculum at this version' })
  snapshot: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Notes about changes in this version' })
  changeNotes: string;

  @ManyToOne(() => Curriculum, curriculum => curriculum.versions)
  @JoinColumn({ name: 'curriculum_id' })
  @ApiProperty({ type: () => Curriculum, description: 'Curriculum this version belongs to' })
  curriculum: Curriculum;

  @Column()
  curriculumId: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'When this version was created' })
  createdAt: Date;
}
