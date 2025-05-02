export interface DataFieldMetadata {
    fieldName: string;
    classification: DataClassification;
    personalData: boolean;
    sensitiveData: boolean;
    legalBasis?: string;
    purpose?: string;
    anonymizationStrategy?: string;
    retentionPeriod?: number;
    retentionPeriodUnit?: RetentionPeriodUnit;
  }