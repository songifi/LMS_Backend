import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() code: string;
  @Column() name: string;
  @Column() credits: number;
  @Column('simple-array') offeredIn: string[];
  @Column() schedule: string;
}
