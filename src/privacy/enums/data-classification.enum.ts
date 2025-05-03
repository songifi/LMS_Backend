export enum DataClassification {
    PUBLIC = 'public',
    INTERNAL = 'internal',
    CONFIDENTIAL = 'confidential',
    RESTRICTED = 'restricted',
    SENSITIVE_PERSONAL = 'sensitive_personal', // Special category under GDPR
    EDUCATIONAL = 'educational', // For FERPA compliance
  }