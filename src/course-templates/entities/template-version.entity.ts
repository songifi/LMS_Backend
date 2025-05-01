import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CourseTemplate } from './course-template.entity';

@Entity('template_versions')
export class TemplateVersion extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  versionNumber: string;

  @Column({ type: 'jsonb' })
  templateData: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  changeLog: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @ManyToOne(() => CourseTemplate, template => template.versions)
  @JoinColumn({ name: 'template_id' })
  template: CourseTemplate;

  @Column()
  templateId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
