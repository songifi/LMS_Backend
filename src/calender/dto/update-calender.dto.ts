import { PartialType } from '@nestjs/mapped-types';
import { CreateCalendarDto } from './create-calender.dto';

export class UpdateCalendarDto extends PartialType(CreateCalendarDto) {}
