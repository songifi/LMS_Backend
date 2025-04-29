import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { LearningPath } from "./learning-path.entity";
import { PathTransition } from "./path-transition.entity";

@Entity()
export class PathNode {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @ManyToOne(() => LearningPath, lp => lp.nodes)
  learningPath: LearningPath;

  @OneToMany(() => PathTransition, pt => pt.fromNode)
  transitions: PathTransition[];

  @Column()
  contentUrl: string;
}

