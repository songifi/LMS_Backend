import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PathNode } from "./path-node.entity";

@Entity()
export class PathTransition {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => PathNode, node => node.transitions)
  fromNode: PathNode;

  @ManyToOne(() => PathNode)
  toNode: PathNode;

  @Column()
  condition: string; // e.g., "score > 70"
}
