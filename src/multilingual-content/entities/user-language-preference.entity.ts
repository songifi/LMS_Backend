import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Language } from './language.entity';

@Entity('user_language_preferences')
export class UserLanguagePreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => Language, language => language.userPreferences)
  @JoinColumn({ name: 'language_id' })
  language: Language;

  @Column()
  languageId: number;

  @Column({ default: false })
  isPrimary: boolean;
}