import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, OneToMany } from 'typeorm';

@Entity('cdn_assets')
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  originalKey: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  width?: number;

  @Column({ nullable: true })
  height?: number;

  @Column({ nullable: true })
  duration?: number;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Column('jsonb')
  optimizedVersions: {
    key: string;
    format: string;
    quality: number;
    width?: number;
    size: number;
  }[];

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column()
  @Index()
  courseId: string;

  @Column()
  @Index()
  moduleId: string;

  @Column({ default: 0 })
  accessCount: number;

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
