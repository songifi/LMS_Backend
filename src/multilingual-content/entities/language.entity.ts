import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Translation } from './translation.entity';
import { ContentTranslation } from './content-translation.entity';
import { UserLanguagePreference } from './user-language-preference.entity';
import { RegionLanguage } from './region-language.entity';

@Entity('languages')
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ default: false })
  isRtl: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @OneToMany(() => Translation, translation => translation.language)
  translations: Translation[];

  @OneToMany(() => ContentTranslation, contentTranslation => contentTranslation.language)
  contentTranslations: ContentTranslation[];

  @OneToMany(() => UserLanguagePreference, preference => preference.language)
  userPreferences: UserLanguagePreference[];

  @OneToMany(() => RegionLanguage, regionLanguage => regionLanguage.language)
  regionLanguages: RegionLanguage[];
}