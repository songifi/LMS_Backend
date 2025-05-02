export class CreateRetentionPolicyDto {
    @IsString()
    name: string;
  
    @IsString()
    description: string;
  
    @IsString()
    entityName: string;
  
    @IsString()
    @IsOptional()
    condition?: string;
  
    @IsNumber()
    retentionPeriod: number;
  
    @IsString()
    retentionPeriodUnit: RetentionPeriodUnit;
  
    @IsBoolean()
    isActive: boolean;
  
    @ValidateNested()
    @Type(() => RetentionActionDto)
    actionOnExpiry: RetentionActionDto;
  }
  
  export class RetentionActionDto {
    @IsString()
    action: 'delete' | 'anonymize' | 'archive';
  
    @IsString()
    @IsOptional()
    strategy?: string;
  }