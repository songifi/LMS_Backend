import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from '../dto/create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}  
