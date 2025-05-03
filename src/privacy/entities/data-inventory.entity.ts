import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('data_inventory')
export class DataInventoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityName: string;

  @Column()
  tableName: string;

  @Column('text')
  description: string;

  @Column()
  dataOwner: string;

  @Column()
  containsPersonalData: boolean;

  @Column('jsonb')
  fields: DataFieldMetadata[];

  @Column('jsonb', { nullable: true })
  relationships: Array<{
    relatedEntity: string;
    type: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
    description: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
