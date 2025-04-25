import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Content } from './content.entity';

@Entity()
export class ContentMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Content, content => content.metadata)
  content: Content;

  @Column()
  key: string;

  @Column('text')
  value: string;

  @Column({ default: false })
  isSearchable: boolean;
}