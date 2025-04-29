import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsEnum, IsDate, IsOptional, IsObject } from "class-validator"
import { Type } from "class-transformer"
import { ReportType } from "../entities/financial-report.entity"

export class CreateFinancialReportDto {
  @ApiProperty({ description: "Title of the report" })
  @IsString()
  title: string

  @ApiProperty({ description: "Type of report", enum: ReportType })
  @IsEnum(ReportType)
  type: ReportType

  @ApiProperty({ description: "Start date of the report period" })
  @IsDate()
  @Type(() => Date)
  startDate: Date

  @ApiProperty({ description: "End date of the report period" })
  @IsDate()
  @Type(() => Date)
  endDate: Date

  @ApiPropertyOptional({ description: "Additional report data" })
  @IsObject()
  @IsOptional()
  additionalData?: Record<string, any>
}
