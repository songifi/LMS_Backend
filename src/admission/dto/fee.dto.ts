import { IsUUID, IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDecimal, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../entities/application-fee.entity';

export class CreateApplicationFeeDto {
  @ApiProperty({ description: 'The application ID this fee is for' })
  @IsUUID()
  applicationId: string;

  @ApiProperty({ description: 'Amount of the fee' })
  @IsDecimal({ decimal_digits: '2' })
  amount: number;

  @ApiPropertyOptional({ description: 'Status of the payment', enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Payment method', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Is the fee waived?' })
  @IsBoolean()
  @IsOptional()
  isWaived?: boolean;

  @ApiPropertyOptional({ description: 'Reason for fee waiver' })
  @IsString()
  @IsOptional()
  waiverReason?: string;

  @ApiPropertyOptional({ description: 'User who waived the fee' })
  @IsString()
  @IsOptional()
  waivedBy?: string;
}

export class UpdateApplicationFeeDto {
  @ApiPropertyOptional({ description: 'Status of the payment', enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Transaction ID from payment provider' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiPropertyOptional({ description: 'Payment provider' })
  @IsString()
  @IsOptional()
  paymentProvider?: string;

  @ApiPropertyOptional({ description: 'Payment method', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Payment date' })
  @IsOptional()
  paidAt?: Date;

  @ApiPropertyOptional({ description: 'Is the fee waived?' })
  @IsBoolean()
  @IsOptional()
  isWaived?: boolean;

  @ApiPropertyOptional({ description: 'Reason for fee waiver' })
  @IsString()
  @IsOptional()
  waiverReason?: string;

  @ApiPropertyOptional({ description: 'User who waived the fee' })
  @IsString()
  @IsOptional()
  waivedBy?: string;

  @ApiPropertyOptional({ description: 'Additional payment details' })
  @IsObject()
  @IsOptional()
  paymentDetails?: Record<string, any>;
}

export class ApplicationFeeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  applicationId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiPropertyOptional()
  transactionId?: string;

  @ApiPropertyOptional()
  paymentProvider?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiProperty()
  isWaived: boolean;

  @ApiPropertyOptional()
  waiverReason?: string;

  @ApiPropertyOptional()
  waivedBy?: string;

  @ApiPropertyOptional()
  paymentDetails?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}