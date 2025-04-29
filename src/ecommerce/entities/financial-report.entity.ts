import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"

export enum ReportType {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUAL = "annual",
  CUSTOM = "custom",
}

@Entity("financial_reports")
export class FinancialReport {
  @ApiProperty({ description: "Unique identifier for the financial report" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "Title of the report" })
  @Column()
  title: string

  @ApiProperty({ description: "Type of report" })
  @Column({
    type: "enum",
    enum: ReportType,
  })
  type: ReportType

  @ApiProperty({ description: "Start date of the report period" })
  @Column()
  startDate: Date

  @ApiProperty({ description: "End date of the report period" })
  @Column()
  endDate: Date

  @ApiProperty({ description: "Total revenue in cents" })
  @Column()
  totalRevenue: number

  @ApiProperty({ description: "Total instructor payouts in cents" })
  @Column()
  totalInstructorPayouts: number

  @ApiProperty({ description: "Total platform fees in cents" })
  @Column()
  totalPlatformFees: number

  @ApiProperty({ description: "Total tax collected in cents" })
  @Column()
  totalTaxCollected: number

  @ApiProperty({ description: "Total refunds in cents" })
  @Column({ default: 0 })
  totalRefunds: number

  @ApiProperty({ description: "Report data in JSON format" })
  @Column("jsonb")
  reportData: Record<string, any>

  @ApiProperty({ description: "Date when the report was created" })
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty({ description: "Date when the report was last updated" })
  @UpdateDateColumn()
  updatedAt: Date
}
