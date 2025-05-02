import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Region } from './region.entity';
import { Language } from './language.entity';

@Entity('region_languages')
export class RegionLanguage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Region, region => region.languages)
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column()
  regionId: number;

  @ManyToOne(() => Language, language => language.regionLanguages)
  @JoinColumn({ name: 'language_id' })
  language: Language;

  @Column()
  languageId: number;

  @Column({ default: false })
  isDefault: boolean;
}