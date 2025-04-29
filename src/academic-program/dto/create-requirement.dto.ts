import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class CreateRequirementDto {
  @ApiProperty({ description: 'Name of the requirement' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the requirement' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type of requirement (Core, Elective, etc.)' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Credits required for this requirement' })
  @IsNumber()
  requiredCredits: number;

  @ApiProperty({ description: 'Additional criteria for this requirement' })
  @IsObject()
  @IsOptional()
  criteria?: Record<string, any>;

  @ApiProperty({ description: 'Program ID this requirement belongs to' })
  @IsString()
  programId: string;
}
