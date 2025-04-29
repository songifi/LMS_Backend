import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsUUID } from "class-validator"
import { ApprovalType } from "../entities/enrollment-approval.entity"

export class CreateEnrollmentApprovalDto {
  @ApiProperty({ description: "Registration ID associated with this approval" })
  @IsNotEmpty()
  @IsUUID()
  registrationId: string

  @ApiProperty({ description: "Type of approval requested", enum: ApprovalType })
  @IsNotEmpty()
  @IsEnum(ApprovalType)
  approvalType: ApprovalType

  @ApiProperty({ description: "ID of the user who requested the approval" })
  @IsNotEmpty()
  @IsString()
  requestedBy: string

  @ApiProperty({ description: "Reason for requesting the approval", required: false })
  @IsOptional()
  @IsString()
  requestReason?: string
}
