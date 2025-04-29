import { ApiProperty } from '@nestjs/swagger';

export class CreateGoalDto {
  @ApiProperty({ example: 'Finish all assignments', description: 'Title of the goal' })
  title: string;

  @ApiProperty({ example: 'Complete all assignments for the current semester', description: 'Description of the goal' })
  description: string;
}
