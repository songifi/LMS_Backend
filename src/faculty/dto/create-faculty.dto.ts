import { IsString, IsOptional, IsUUID, IsUrl } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsUUID()
  @IsOptional()
  facultyHeadId?: string;
}

export class UpdateFacultyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsUUID()
  @IsOptional()
  facultyHeadId?: string;
}

export class FacultySettingsDto {
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  themePreferences?: Record<string, any>;

  @IsOptional()
  notificationSettings?: Record<string, any>;

  @IsOptional()
  accessibilitySettings?: Record<string, any>;
  
  @IsOptional()
  customFields?: any[];
}

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  facultyId: string;

  @IsUUID()
  @IsOptional()
  departmentHeadId?: string;
}

export class FacultyAdministratorDto {
  @IsUUID()
  userId: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString({ each: true })
  permissions?: string[];
}