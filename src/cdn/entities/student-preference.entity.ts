import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('cdn_student_preferences')
export class StudentPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  studentId: string;

  @Column('jsonb', { default: {} })
  accessPatterns: {
    dayOfWeek: number;
    hourOfDay: number;
    frequency: number;
  }[];

  @Column('jsonb', { default: [] })
  frequentlyAccessedContent: {
    assetId: string;
    count: number;
    lastAccessed: Date;
  }[];

  @Column('jsonb', { default: {} })
  deviceInfo: {
    type: string;
    browser: string;
    os: string;
    preferredQuality?: string;
    averageBandwidth?: number;
  };

  @Column('jsonb', { default: [] })
  courseProgress: {
    courseId: string;
    moduleId: string;
    progress: number;
    lastAccessed: Date;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
