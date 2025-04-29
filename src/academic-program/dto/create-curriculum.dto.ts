import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateCurriculumDto {
  @ApiProperty({ description: 'Name of the curriculum' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Curriculum description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Academic year this curriculum is for' })
  @IsString()
  academicYear: string;

  @ApiProperty({ description: 'Whether this is the current curriculum', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Total credits in this curriculum' })
  @IsNumber()
  totalCredits: number;

  @ApiProperty({ description: 'Program ID this curriculum belongs to' })
  @IsString()
  programId: string;
}