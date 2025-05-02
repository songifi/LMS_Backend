import { PartialType } from '@nestjs/swagger';
import { CreateRealTimeNotificationDto } from './create-real-time-notification.dto';

export class UpdateRealTimeNotificationDto extends PartialType(CreateRealTimeNotificationDto) {}
