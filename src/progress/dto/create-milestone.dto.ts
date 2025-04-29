import { ApiProperty } from '@nestjs/swagger';

export class CreateMilestoneDto {
  @ApiProperty({ example: 'Complete Module 1', description: 'Title of the milestone' })
  title: string;

  @ApiProperty({ example: 'Finish all lessons in Module 1', description: 'Description of the milestone' })
  description: string;
}
