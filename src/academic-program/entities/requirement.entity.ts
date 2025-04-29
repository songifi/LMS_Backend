import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Program } from './academic-program.entity';

@Entity('requirements')
export class Requirement {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the requirement' })
  id: string;

  @Column({ length: 100 })
  @ApiProperty({ description: 'Name of the requirement' })
  name: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Description of the requirement' })
  description: string;

  @Column()
  @ApiProperty({ description: 'Type of requirement (Core, Elective, etc.)' })
  type: string;

  @Column()
  @ApiProperty({ description: 'Credits required for this requirement' })
  requiredCredits: number;

  @Column({ type: 'json', nullable: true })
  @ApiProperty({ description: 'Additional criteria for this requirement' })
  criteria: Record<string, any>;

  @ManyToOne(() => Program, program => program.requirements)
  @JoinColumn({ name: 'program_id' })
  @ApiProperty({ type: () => Program, description: 'Program this requirement belongs to' })
  program: Program;

  @Column()
  programId: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'When the requirement was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'When the requirement was last updated' })
  updatedAt: Date;
}
