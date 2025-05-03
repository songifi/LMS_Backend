import { IsString, IsBoolean, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class DataFieldMetadataDto {
  @IsString()
  fieldName: string;

  @IsString()
  classification: DataClassification;

  @IsBoolean()
  personalData: boolean;

  @IsBoolean()
  sensitiveData: boolean;

  @IsString()
  @IsOptional()
  legalBasis?: string;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsString()
  @IsOptional()
  anonymizationStrategy?: string;

  @IsOptional()
  retentionPeriod?: number;

  @IsString()
  @IsOptional()
  retentionPeriodUnit?: RetentionPeriodUnit;
}

export class DataRelationshipDto {
  @IsString()
  relatedEntity: string;

  @IsString()
  type: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';

  @IsString()
  description: string;
}

export class CreateDataInventoryDto {
  @IsString()
  entityName: string;

  @IsString()
  tableName: string;

  @IsString()
  description: string;

  @IsString()
  dataOwner: string;

  @IsBoolean()
  containsPersonalData: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataFieldMetadataDto)
  fields: DataFieldMetadataDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataRelationshipDto)
  @IsOptional()
  relationships?: DataRelationshipDto[];
}
