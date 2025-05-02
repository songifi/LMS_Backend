import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Language } from './language.entity';

@Entity('translations')
export class Translation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @ManyToOne(() => Language, language => language.translations)
  @JoinColumn({ name: 'language_id' })
  language: Language;

  @Column()
  languageId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isAutoTranslated: boolean;
}