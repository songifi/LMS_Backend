import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Content } from './content.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class ContentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Content, content => content.versions)
  content: Content;

  @Column()
  version: number;

  @Column()
  filePath: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column('text', { nullable: true })
  changeNotes: string;

  @ManyToOne(() => User)
  creator: User;

  @CreateDateColumn()
  createdAt: Date;
}