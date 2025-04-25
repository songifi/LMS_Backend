import { IsEnum, IsOptional, IsUUID, IsDateString, IsObject } from 'class-validator';
import { AccessType } from '../enums/accessType.enum';

export class CreateContentAccessDto {
  @IsEnum(AccessType)
  accessType: AccessType;

  @IsUUID()
  @IsOptional()
  accessId?: string;

  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @IsDateString()
  @IsOptional()
  availableUntil?: string;

  @IsObject()
  @IsOptional()
  conditions?: any;
}
