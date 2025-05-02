import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class VerificationPortal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  publicUrl: string;

  @Column()
  status: string;
}