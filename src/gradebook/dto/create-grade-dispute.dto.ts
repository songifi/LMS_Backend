import { IsString, IsNumber, IsOptional, IsUUID } from "class-validator"

export class CreateGradeDisputeDto {
  @IsUUID()
  gradebookEntryId: string

  @IsString()
  reason: string

  @IsString()
  @IsOptional()
  evidence?: string

  @IsNumber()
  @IsOptional()
  proposedScore?: number

  @IsString()
  @IsOptional()
  proposedLetterGrade?: string
}
