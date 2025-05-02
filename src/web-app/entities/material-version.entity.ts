
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Material } from './material.entity';

@Entity('material_versions')
export class MaterialVersion {
  @PrimaryGeneratedColumn()
  id: number;
  
  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material: Material;
  
  @Column({ type: 'varchar', length: 50 })
  type: string; // 'original', 'low-quality', 'transcript', 'text-only', etc.
  
  @Column({ type: 'text', nullable: true })
  content: string;
  
  @Column({ type: 'varchar', length: 500, nullable: true })
  contentUrl: string;
  
  @Column({ type: 'integer', default: 0 })
  size: number; // Size in KB
  
  @Column({ type: 'timestamp' })
  createdAt: Date;
}