import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { Content } from './content.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class ContentModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 0 })
  orderIndex: number;

  @OneToMany(() => Content, content => content.module)
  contents: Content[];

  @ManyToOne(() => User)
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ nullable: true })
  publishedAt: Date;
  
  @ManyToOne(() => ContentModule, module => module, { nullable: true })
  parentModule?: ContentModule;  
}