import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CredentialWallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('jsonb')
  credentials: any[];
}
