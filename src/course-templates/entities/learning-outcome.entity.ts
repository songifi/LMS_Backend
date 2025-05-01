import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CourseTemplate } from './course-template.entity';

@Entity('learning_outcomes')
export class LearningOutcome extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'int' })
  sequenceOrder: number;

  @ManyToOne(() => CourseTemplate, template => template.learningOutcomes)
  @JoinColumn({ name: 'template_id' })
  template: CourseTemplate;

  @Column()
  templateId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}