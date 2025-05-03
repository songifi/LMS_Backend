import { IsNotEmpty, IsString, IsOptional, IsArray, IsObject, IsBoolean } from 'class-validator';

export class NamesRolesServiceMemberDto {
  @IsNotEmpty()
  @IsString()
  status: string; // Active, Inactive, Deleted

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  given_name?: string;

  @IsOptional()
  @IsString()
  family_name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsArray()
  roles: string[];

  @IsOptional()
  @IsObject()
  lis_person_sourcedid?: string;

  @IsOptional()
  @IsObject()
  message?: Record<string, any>;
}

export class NamesRolesServiceResponseDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  context: {
    id: string;
    label: string;
    title: string;
  };

  @IsNotEmpty()
  @IsArray()
  members: NamesRolesServiceMemberDto[];

  @IsOptional()
  @IsBoolean()
  hasMore?: boolean;

  @IsOptional()
  @IsString()
  nextPage?: string;
}

export class NamesRolesQueryDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  limit?: number;

  @IsOptional()
  @IsString()
  rlid?: string; // Resource link ID
}