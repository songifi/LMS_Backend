import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Assessment } from './assessment.entity';

@Entity()
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @OneToOne(() => Assessment)
  @JoinColumn()
  assessment: Assessment;

  @Column({ default: true })
  requireProctoring: boolean;

  @Column({ default: false })
  allowCalculator: boolean;

  @Column({ default: false })
  requireWebcam: boolean;

  @Column({ default: false })
  requireScreensharing: boolean;

  @Column({ default: false })
  preventBrowserNavigation: boolean;
}
