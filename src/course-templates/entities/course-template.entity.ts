import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TemplateVersion } from './template-version.entity';
import { ContentBlock } from './content-block.entity';
import { LearningOutcome } from './learning-outcome.entity';
import { AssessmentStructure } from './assessment-structure.entity';

@Entity('course_templates')
export class CourseTemplate extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  department: string;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @ManyToOne(() => CourseTemplate, { nullable: true })
  @JoinColumn({ name: 'parent_template_id' })
  parentTemplate: CourseTemplate;

  @Column({ nullable: true })
  parentTemplateId: string;

  @OneToMany(() => TemplateVersion, version => version.template)
  versions: TemplateVersion[];

  @OneToMany(() => ContentBlock, contentBlock => contentBlock.template)
  contentBlocks: ContentBlock[];

  @OneToMany(() => LearningOutcome, outcome => outcome.template)
  learningOutcomes: LearningOutcome[];

  @OneToMany(() => AssessmentStructure, assessment => assessment.template)
  assessmentStructures: AssessmentStructure[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}