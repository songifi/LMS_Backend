import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('cdn_cache')
export class CacheEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  key: string;

  @Column()
  @Index()
  edgeNodeId: string;

  @Column()
  assetId: string;

  @Column()
  region: string;

  @Column('timestamp')
  @Index()
  expiresAt: Date;

  @Column({ default: 0 })
  hitCount: number;

  @Column({ default: false })
  isStale: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
