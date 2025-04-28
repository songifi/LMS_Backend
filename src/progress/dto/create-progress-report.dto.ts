import { ApiProperty } from '@nestjs/swagger';

export class CreateProgressReportDto {
  @ApiProperty({ example: 'Completed 80% of coursework', description: 'Content of the progress report' })
  reportContent: string;
}
