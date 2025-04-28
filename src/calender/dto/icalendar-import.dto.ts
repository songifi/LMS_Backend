import { IsString } from 'class-validator';

export class ICalendarImportDto {
  @IsString()
  iCalData: string;
}