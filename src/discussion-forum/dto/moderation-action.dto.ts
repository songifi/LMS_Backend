import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum ModerationAction {
  APPROVE = 'approve',
  REMOVE = 'remove',
  WARN = 'warn',
}

export class ModerationActionDto {
  @IsEnum(ModerationAction)
  action: ModerationAction;

  @IsString()
  @IsOptional()
  reason?: string;
}