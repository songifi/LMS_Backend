import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVerificationRecordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  credentialId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  verifier: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purpose: string;
}
