import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PathNode } from "./path-node.entity";

@Entity()
export class LearnerProgress {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  learnerId: string;

  @ManyToOne(() => PathNode)
  currentNode: PathNode;

  @Column({ type: 'float', nullable: true })
  score: number;

  @CreateDateColumn()
  updatedAt: Date;
}
