import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class VerificationRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  credentialId: number;

  @Column()
  verifiedAt: Date;

  @Column()
  status: string;
}