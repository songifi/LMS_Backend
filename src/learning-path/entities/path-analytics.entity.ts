import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LearningPath } from "./learning-path.entity";

@Entity()
export class PathAnalytics {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => LearningPath)
  learningPath: LearningPath;

  @Column()
  averageScore: number;

  @Column()
  completionRate: number;
}
