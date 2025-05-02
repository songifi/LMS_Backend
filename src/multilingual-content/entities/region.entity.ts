import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RegionLanguage } from './region-language.entity';

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => RegionLanguage, regionLanguage => regionLanguage.region)
  languages: RegionLanguage[];
}