import { IsEnum, IsOptional, IsString, IsEmail, IsPhoneNumber } from 'class-validator';
import { MfaMethod } from '../enums/mfa-method.enum';

export class SetupMfaDto {
  @IsEnum(MfaMethod)
  method: MfaMethod;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}