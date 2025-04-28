import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ReportTemplate } from './report-template.entity';

@Entity()
export class ReportParameter {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the parameter' })
  id: string;

  @ManyToOne(() => ReportTemplate, template => template.parameters)
  @ApiProperty({ type: () => ReportTemplate, description: 'Report template this parameter belongs to' })
  template: ReportTemplate;


  @Column()
  @ApiProperty({ description: 'Name of the parameter' })
  name: string;

  @Column()
  @ApiProperty({ description: 'Human-readable label for the parameter' })
  label: string;

  @Column()
  @ApiProperty({ description: 'Data type of the parameter (string, number, date, etc.)' })
  dataType: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Default value for the parameter', required: false })
  defaultValue: string;

  @Column({ default: false })
  @ApiProperty({ description: 'Whether this parameter is required' })
  required: boolean;
}
