import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Content } from './content.entity';
import { Language } from './language.entity';

@Entity('content_translations')
export class ContentTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Content, content => content.translations)
  @JoinColumn({ name: 'content_id' })
  content: Content;

  @Column()
  contentId: number;

  @ManyToOne(() => Language, language => language.contentTranslations)
  @JoinColumn({ name: 'language_id' })
  language: Language;

  @Column()
  languageId: number;

  @Column({ type: 'text' })
  value: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isAutoTranslated: boolean;
}