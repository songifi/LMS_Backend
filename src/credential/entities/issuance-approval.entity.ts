import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class IssuanceApproval {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  credentialId: number;

  @Column()
  status: string; // pending, approved, rejected

  @Column()
  reviewedBy: string;

  @Column()
  reviewedAt: Date;
}
