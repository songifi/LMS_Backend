import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional, IsDateString, IsArray, ValidateNested, IsNumber, IsPositive, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { FormStatus } from '../entities/application-form.entity';
import { FieldType } from '../entities/form-field.entity';

export class FormFieldDto {
  @ApiProperty({ description: 'Label of the form field' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({ description: 'Description of the form field' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Type of the form field', enum: FieldType })
  @IsEnum(FieldType)
  type: FieldType;

  @ApiPropertyOptional({ description: 'Is the field required?' })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Validation rules for the field' })
  @IsObject()
  @IsOptional()
  validations?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Options for select, multiselect, radio, checkbox' })
  @IsArray()
  @IsOptional()
  options?: any[];

  @ApiPropertyOptional({ description: 'Display order of the field' })
  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateApplicationFormDto {
  @ApiProperty({ description: 'Name of the application form' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the application form' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The program ID this form is for' })
  @IsString()
  @IsNotEmpty()
  programId: string;

  @ApiPropertyOptional({ description: 'Status of the form', enum: FormStatus, default: FormStatus.DRAFT })
  @IsEnum(FormStatus)
  @IsOptional()
  status?: FormStatus;

  @ApiPropertyOptional({ description: 'Is this the default form for the program?' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Form start date' })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Form end date' })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Form fields', type: [FormFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  @IsOptional()
  fields?: FormFieldDto[];
}

export class UpdateApplicationFormDto {
  @ApiPropertyOptional({ description: 'Name of the application form' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the application form' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Status of the form', enum: FormStatus })
  @IsEnum(FormStatus)
  @IsOptional()
  status?: FormStatus;

  @ApiPropertyOptional({ description: 'Is this the default form for the program?' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Form start date' })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Form end date' })
  @IsDateString()
  @IsOptional()
  endDate?: Date;
}

export class ApplicationFormResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  programId: string;

  @ApiProperty({ enum: FormStatus })
  status: FormStatus;

  @ApiProperty()
  isDefault: boolean;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  endDate?: Date;

  @ApiProperty({ type: [FormFieldDto] })
  fields: FormFieldDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}