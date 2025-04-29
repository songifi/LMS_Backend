import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class CreateCurriculumVersionDto {
  @ApiProperty({ description: 'Version number' })
  @IsNumber()
  versionNumber: number;

  @ApiProperty({ description: 'Snapshot of the curriculum at this version' })
  @IsObject()
  snapshot: Record<string, any>;

  @ApiProperty({ description: 'Notes about changes in this version', required: false })
  @IsString()
  @IsOptional()
  changeNotes?: string;

  @ApiProperty({ description: 'Curriculum ID this version belongs to' })
  @IsString()
  curriculumId: string;
}
