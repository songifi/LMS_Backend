import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class SubmitResponseDto {
  @IsString()
  questionId: string;

  response: any;

  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @IsOptional()
  @IsBoolean()
  hintUsed?: boolean;

  @IsOptional()
  @IsBoolean()
  skipped?: boolean;
}