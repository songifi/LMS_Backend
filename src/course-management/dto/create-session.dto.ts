import { IsUUID, IsString, IsDateString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  courseId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;

  @IsString()
  location: string;

  @IsUUID()
  instructorId: string;

  @IsNumber()
  maxCapacity: number;

  @IsArray()
  @IsOptional()
  materials?: string[];
}
