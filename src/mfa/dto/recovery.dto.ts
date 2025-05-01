import { IsString } from 'class-validator';

export class VerifyRecoveryCodeDto {
  @IsString()
  code: string;
}