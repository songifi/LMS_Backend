import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class ProgressReport {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.progressReports)
  student: User;

  @Column('text')
  reportContent: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
