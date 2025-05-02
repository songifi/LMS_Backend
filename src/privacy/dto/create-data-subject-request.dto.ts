export class CreateDataSubjectRequestDto {
    @IsString()
    subjectId: string;
  
    @IsString()
    requestType: DataSubjectRequestType;
  
    @IsString()
    requestDetails: string;
  
    @IsArray()
    @IsOptional()
    affectedSystems?: string[];
  }
  