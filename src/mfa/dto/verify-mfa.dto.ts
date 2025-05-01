import { IsEnum, IsString } from 'class-validator';
import { MfaMethod } from '../enums/mfa-method.enum';

export class VerifyMfaDto {
  @IsEnum(MfaMethod)
  method: MfaMethod;

  @IsString()
  token: string;
}
