import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ContentTranslation } from './content-translation.entity';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  type: string;

  @Column({ length: 255 })
  identifier: string;

  @OneToMany(() => ContentTranslation, contentTranslation => contentTranslation.content)
  translations: ContentTranslation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}