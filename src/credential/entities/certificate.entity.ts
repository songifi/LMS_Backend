import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CertificateTemplate } from './certificate-template.entity';

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => CertificateTemplate)
  template: CertificateTemplate;

  @Column()
  courseName: string;

  @Column()
  issuedDate: Date;

  @Column()
  hash: string;
}
