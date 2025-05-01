import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CertificateTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  layout: string; // JSON or HTML for rendering
}
