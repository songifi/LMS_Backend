import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class UpdateNotificationPreferencesDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;
}