import { ApiProperty } from "@nestjs/swagger"
import {
  IsString,
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
import { SessionStatus } from "../entities/live-session.entity"
import { VideoProvider } from "../entities/video-conference.entity"

export class UpdateVideoConferenceDto {
  @ApiProperty({
    description: "Video conferencing provider",
    enum: VideoProvider,
    required: false,
  })
  @IsEnum(VideoProvider)
  @IsOptional()
  provider?: VideoProvider

  @ApiProperty({
    description: "Meeting ID from the provider",
    required: false,
  })
  @IsString()
  @IsOptional()
  meetingId?: string

  @ApiProperty({
    description: "Join URL for the meeting",
    required: false,
  })
  @IsString()
  @IsOptional()
  joinUrl?: string

  @ApiProperty({
    description: "Host key or password",
    required: false,
  })
  @IsString()
  @IsOptional()
  hostKey?: string

  @ApiProperty({
    description: "Participant password",
    required: false,
  })
  @IsString()
  @IsOptional()
  participantPassword?: string

  @ApiProperty({
    description: "Additional provider-specific settings",
    required: false,
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>
}

export class UpdateLiveSessionDto {
  @ApiProperty({
    description: "Title of the live session",
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({
    description: "Description of the live session",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: "Scheduled start time of the session",
    required: false,
  })
  @IsDateString()
  @IsOptional()
  scheduledStartTime?: string

  @ApiProperty({
    description: "Actual start time of the session",
    required: false,
  })
  @IsDateString()
  @IsOptional()
  actualStartTime?: string

  @ApiProperty({
    description: "End time of the session",
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endTime?: string

  @ApiProperty({
    description: "Current status of the session",
    enum: SessionStatus,
    required: false,
  })
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus

  @ApiProperty({
    description: "Maximum number of participants allowed",
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  maxParticipants?: number

  @ApiProperty({
    description: "Whether the session should be recorded",
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  recordSession?: boolean

  @ApiProperty({
    description: "Video conference configuration",
    type: UpdateVideoConferenceDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => UpdateVideoConferenceDto)
  @IsOptional()
  videoConference?: UpdateVideoConferenceDto
}
