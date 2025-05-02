import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIssuanceApprovalDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  credentialId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  approverId: string;
}
