import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CourseTemplate } from './course-template.entity';

@Entity('assessment_structures')
export class AssessmentStructure extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  assessmentType: string;

  @Column({ type: 'int' })
  weightPercentage: number;

  @Column({ type: 'jsonb', nullable: true })
  criteria: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => CourseTemplate, template => template.assessmentStructures)
  @JoinColumn({ name: 'template_id' })
  template: CourseTemplate;

  @Column()
  templateId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}