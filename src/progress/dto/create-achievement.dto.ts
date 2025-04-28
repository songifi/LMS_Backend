import { ApiProperty } from '@nestjs/swagger';

export class CreateAchievementDto {
  @ApiProperty({ example: 'Top Performer', description: 'Name of the achievement' })
  name: string;

  @ApiProperty({ example: 'Awarded for highest scores in all assessments', description: 'Achievement description' })
  description: string;
}
