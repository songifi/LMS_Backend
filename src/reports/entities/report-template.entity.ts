import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Report } from './report.entity';
import { ReportParameter } from './report-parameter.entity';
import { ReportSchedule } from './report-schedule.entity';

@Entity()
export class ReportTemplate {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the report template' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Name of the report template' })
  name: string;

  @Column()
  @ApiProperty({ description: 'Description of the report template' })
  description: string;

  @Column()
  @ApiProperty({ description: 'Type of report (dashboard, course, user, custom)' })
  type: string;

  @Column('jsonb')
  @ApiProperty({ description: 'Definition of the report structure and queries' })
  definition: Record<string, any>;

  @OneToMany(() => ReportParameter, parameter => parameter.template)
  @ApiProperty({ type: () => [ReportParameter], description: 'List of parameters for the report template' })
  parameters: ReportParameter[];

  @OneToMany(() => Report, report => report.template)
  @ApiProperty({ type: () => [Report], description: 'List of generated reports based on this template' })
  reports: Report[];

  @OneToMany(() => ReportSchedule, schedule => schedule.template)
  @ApiProperty({ type: () => [ReportSchedule], description: 'Schedules associated with this report template' })
  schedules: ReportSchedule[];
}
