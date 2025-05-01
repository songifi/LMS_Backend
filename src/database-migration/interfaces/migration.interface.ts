import { QueryRunner } from 'typeorm';

export interface IMigration {
  name: string;
  filePath: string;
  checksum: string;
  
  // Standard migration methods
  up: (queryRunner: QueryRunner) => Promise<void>;
  down: (queryRunner: QueryRunner) => Promise<void>;
  
  // Zero-downtime migration methods (optional)
  safeUp?: (queryRunner: QueryRunner) => Promise<void>;
  safeDown?: (queryRunner: QueryRunner) => Promise<void>;
  
  // Verification methods (optional)
  verify?: (queryRunner: QueryRunner) => Promise<boolean>;
}
