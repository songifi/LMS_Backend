import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsDate, ValidateNested, IsArray } from "class-validator"
import { Type } from "class-transformer"
import { AssessmentType } from "../enums/assessmentType.enum"
import { CreateQuestionDto } from "./create-question.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateAssessmentDto {
  @ApiProperty({
    description: "Assessment title",
    example: "Midterm Exam",
  })
  @IsString()
  title: string

  @ApiPropertyOptional({
    description: "Assessment description",
    example: "Comprehensive midterm covering chapters 1-5",
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: "Assessment type",
    enum: AssessmentType,
    example: AssessmentType.EXAM,
  })
  @IsEnum(AssessmentType)
  type: AssessmentType

  @ApiPropertyOptional({
    description: "Assessment instructions",
    example: "You have 2 hours to complete this exam. No external resources allowed.",
  })
  @IsString()
  @IsOptional()
  instructions?: string

  @ApiPropertyOptional({
    description: "Total points possible",
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  totalPoints?: number

  @ApiPropertyOptional({
    description: "Whether the assessment is published",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean

  @ApiPropertyOptional({
    description: "Whether late submissions are allowed",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allowLateSubmissions?: boolean

  @ApiPropertyOptional({
    description: "Assessment start date",
    example: "2023-10-15T09:00:00Z",
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date

  @ApiPropertyOptional({
    description: "Assessment end date",
    example: "2023-10-15T11:00:00Z",
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date

  @ApiPropertyOptional({
    description: "Time limit in minutes",
    example: 120,
  })
  @IsNumber()
  @IsOptional()
  timeLimit?: number

  @ApiPropertyOptional({
    description: "Whether to check for plagiarism",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  enablePlagiarismCheck?: boolean

  @ApiPropertyOptional({
    description: "Maximum number of attempts allowed",
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  maxAttempts?: number

  @ApiPropertyOptional({
    description: "Assessment questions",
    type: [CreateQuestionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsOptional()
  questions?: CreateQuestionDto[]

  // Type-specific properties
  @ApiPropertyOptional({
    description: "Whether file submissions are allowed",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allowFileSubmissions?: boolean

  @ApiPropertyOptional({
    description: "Allowed file types",
    example: ["pdf", "docx", "txt"],
  })
  @IsArray()
  @IsOptional()
  allowedFileTypes?: string[]

  @ApiPropertyOptional({
    description: "Maximum file size in MB",
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  maxFileSize?: number

  @ApiPropertyOptional({
    description: "Whether to randomize questions",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  randomizeQuestions?: boolean

  @ApiPropertyOptional({
    description: "Whether to show correct answers after submission",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  showCorrectAnswers?: boolean

  @ApiPropertyOptional({
    description: "Whether proctoring is required",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requireProctoring?: boolean

  @ApiPropertyOptional({
    description: "Whether webcam is required",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requireWebcam?: boolean

  @ApiPropertyOptional({
    description: "Whether to show feedback immediately",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  showFeedbackImmediately?: boolean
}
