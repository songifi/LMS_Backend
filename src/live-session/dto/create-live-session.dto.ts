import { ApiProperty } from "@nestjs/swagger"
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsInt,
  IsObject,
  Min,
  ValidateNested,
} from "class-validator"
import { Type } from "class-transformer"
import { VideoProvider } from "../entities/video-conference.entity"

export class CreateVideoConferenceDto {
  @ApiProperty({
    description: "Video conferencing provider",
    enum: VideoProvider,
    example: VideoProvider.ZOOM,
  })
  @IsEnum(VideoProvider)
  provider: VideoProvider

  @ApiProperty({
    description: "Meeting ID from the provider",
    example: "123456789",
  })
  @IsString()
  @IsOptional()
  meetingId?: string

  @ApiProperty({
    description: "Join URL for the meeting",
    example: "https://zoom.us/j/123456789",
  })
  @IsString()
  @IsOptional()
  joinUrl?: string

  @ApiProperty({
    description: "Host key or password",
    example: "123456",
    required: false,
  })
  @IsString()
  @IsOptional()
  hostKey?: string

  @ApiProperty({
    description: "Participant password",
    example: "123456",
    required: false,
  })
  @IsString()
  @IsOptional()
  participantPassword?: string

  @ApiProperty({
    description: "Additional provider-specific settings",
    required: false,
    example: { waitingRoom: true },
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>
}

export class CreateLiveSessionDto {
  @ApiProperty({
    description: "Title of the live session",
    example: "Introduction to NestJS",
  })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({
    description: "Description of the live session",
    example: "Learn the basics of NestJS framework",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: "Scheduled start time of the session",
    example: "2023-06-15T14:00:00Z",
  })
  @IsDateString()
  scheduledStartTime: string

  @ApiProperty({
    description: "Maximum number of participants allowed",
    example: 100,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  maxParticipants?: number

  @ApiProperty({
    description: "Whether the session should be recorded",
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  recordSession?: boolean

  @ApiProperty({
    description: "Video conference configuration",
    type: CreateVideoConferenceDto,
  })
  @ValidateNested()
  @Type(() => CreateVideoConferenceDto)
  videoConference: CreateVideoConferenceDto
}
