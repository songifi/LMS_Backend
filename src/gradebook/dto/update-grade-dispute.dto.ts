import { IsString, IsEnum, IsOptional, IsUUID } from "class-validator"

export class UpdateGradeDisputeDto {
  @IsEnum(["pending", "under_review", "approved", "rejected", "resolved"])
  @IsOptional()
  status?: "pending" | "under_review" | "approved" | "rejected" | "resolved"

  @IsString()
  @IsOptional()
  resolution?: string

  @IsUUID()
  @IsOptional()
  reviewedById?: string
}
