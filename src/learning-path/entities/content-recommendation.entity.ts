import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ContentRecommendation {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  learnerId: string;

  @Column()
  recommendation: string;

  @Column()
  reason: string;
}
