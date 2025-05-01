import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, Max, IsArray } from 'class-validator';
import { MfaMethod } from '../enums/mfa-method.enum';

export class MfaConfigDto {
  @IsBoolean()
  enforceMfa: boolean;

  @IsArray()
  @IsString({ each: true })
  requiredRoles: string[];

  @IsArray()
  @IsEnum(MfaMethod, { each: true })
  allowedMethods: MfaMethod[];

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(60)
  totpStepSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(6)
  @Max(8)
  totpDigits?: number;

  @IsOptional()
  @IsString()
  totpAlgorithm?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(20)
  recoveryCodesCount?: number;

  @IsOptional()
  @IsBoolean()
  allowUserToManageMfa?: boolean;
}