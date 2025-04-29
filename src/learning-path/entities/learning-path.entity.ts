import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PathNode } from "./path-node.entity";

@Entity()
export class LearningPath {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @OneToMany(() => PathNode, node => node.learningPath, { cascade: true })
  nodes: PathNode[];

  @CreateDateColumn()
  createdAt: Date;
}
