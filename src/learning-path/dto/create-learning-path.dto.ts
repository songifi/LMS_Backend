import { ApiProperty } from '@nestjs/swagger';

export class CreateLearningPathDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;
}