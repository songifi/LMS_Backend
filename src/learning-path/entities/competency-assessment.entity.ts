import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CompetencyAssessment {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  learnerId: string;

  @Column()
  skill: string;

  @Column({ type: 'float' })
  score: number;

  @Column()
  passed: boolean;
}
