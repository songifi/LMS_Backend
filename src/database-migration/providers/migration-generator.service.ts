import { Injectable, Logger, Inject } from '@nestjs/common';
import { Connection } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { MigrationConfig } from '../interfaces/migration-config.interface';

export interface GenerateMigrationOptions {
  name: string;
  empty?: boolean;
  addTimestamp?: boolean;
  type?: 'standard' | 'zero-downtime';
}

@Injectable()
export class MigrationGenerator {
  private readonly logger = new Logger(MigrationGenerator.name);

  constructor(
    private connection: Connection,
    @Inject('MIGRATION_CONFIG') private config: MigrationConfig,
  ) {}

  async generateMigration(options: GenerateMigrationOptions): Promise<string> {
    const timestamp = options.addTimestamp ? `${Date.now()}_` : '';
    const migrationName = `${timestamp}${options.name}`;
    const migrationsDir = this.config.migrationsDir || path.join(process.cwd(), 'migrations');
    
    // Ensure migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    const migrationFilePath = path.join(migrationsDir, `${migrationName}.ts`);
    
    // Generate migration content
    let content: string;
    
    if (options.empty) {
      content = this.generateEmptyMigration(options.type || 'standard');
    } else {
      // Try to generate migration from schema changes
      content = await this.generateMigrationFromSchema(options.type || 'standard');
    }
    
    // Write migration file
    fs.writeFileSync(migrationFilePath, content);
    
    this.logger.log(`Generated migration file: ${migrationFilePath}`);
    return migrationFilePath;
  }
  
  private generateEmptyMigration(type: 'standard' | 'zero-downtime'): string {
    if (type === 'zero-downtime') {
      return `import { QueryRunner } from 'typeorm';

/**
 * Zero-downtime migration
 * 
 * This migration follows the zero-downtime deployment pattern:
 * 1. Deploy new code that works with both old and new schema
 * 2. Apply schema changes in a backward-compatible way
 * 3. Deploy code that works with new schema only
 * 4. Clean up transitional elements
 */
export const safeUp = async (queryRunner: QueryRunner): Promise<void> => {
  // Stage 1: Schema additions (new tables, columns with defaults or NULLs)
  
  // Stage 2: Create and populate any new columns/tables with data
  
  // Stage 3: Create new constraints/indexes CONCURRENTLY
  
  // Stage 4: Rename or repurpose any old columns/tables (schema transition)
};

export const safeDown = async (queryRunner: QueryRunner): Promise<void> => {
  // Revert changes in reverse order
  
  // Stage 4: Restore original names
  
  // Stage 3: Remove new constraints/indexes
  
  // Stage 2: Remove any new data transformations
  
  // Stage 1: Remove schema additions
};

// Standard methods (as fallback)
export const up = async (queryRunner: QueryRunner): Promise<void> => {
  await safeUp(queryRunner);
};

export const down = async (queryRunner: QueryRunner): Promise<void> => {
  await safeDown(queryRunner);
};

// Verification method
export const verify = async (queryRunner: QueryRunner): Promise<boolean> => {
  // Add data consistency checks here
  return true;
};`;
    } else {
      return `import { QueryRunner } from 'typeorm';

export const up = async (queryRunner: QueryRunner): Promise<void> => {
  // Write your migration code here
  
};

export const down = async (queryRunner: QueryRunner): Promise<void> => {
  // Write your rollback code here
  
};`;
    }
  }
  
  private async generateMigrationFromSchema(type: 'standard' | 'zero-downtime'): Promise<string> {
    // This would normally use TypeORM's SchemaBuilder to diff current schema with DB
    // For this example, we'll return a template with common patterns
    if (type === 'zero-downtime') {
      return `import { QueryRunner } from 'typeorm';

/**
 * Zero-downtime migration for adding a new column and index
 */
export const safeUp = async (queryRunner: QueryRunner): Promise<void> => {
  // Stage 1: Add new column (nullable first, so existing rows are unaffected)
  await queryRunner.query(\`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN DEFAULT NULL\`);
  
  // Stage 2: Set default values for existing rows
  await queryRunner.query(\`UPDATE "users" SET "email_verified" = FALSE WHERE "email_verified" IS NULL\`);
  
  // Stage 3: Create index CONCURRENTLY (doesn't block reads/writes)
  await queryRunner.query(\`CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_users_email_verified" ON "users" ("email_verified")\`);
  
  // Stage 4: After application code is updated to handle this field, you can make it NOT NULL
  // await queryRunner.query(\`ALTER TABLE "users" ALTER COLUMN "email_verified" SET NOT NULL\`);
};

export const safeDown = async (queryRunner: QueryRunner): Promise<void> => {
  // Revert changes in reverse order
  
  // Stage 4: Remove constraint if it was added
  // await queryRunner.query(\`ALTER TABLE "users" ALTER COLUMN "email_verified" DROP NOT NULL\`);
  
  // Stage 3: Drop index CONCURRENTLY
  await queryRunner.query(\`DROP INDEX CONCURRENTLY IF EXISTS "idx_users_email_verified"\`);
  
  // Stage 2: No need to undo data changes
  
  // Stage 1: Remove column
  await queryRunner.query(\`ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verified"\`);
};

// Standard methods (as fallback)
export const up = async (queryRunner: QueryRunner): Promise<void> => {
  await safeUp(queryRunner);
};

export const down = async (queryRunner: QueryRunner): Promise<void> => {
  await safeDown(queryRunner);
};

// Verification method
export const verify = async (queryRunner: QueryRunner): Promise<boolean> => {
  // Verify column exists
  const result = await queryRunner.query(\`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email_verified'
    );
  \`);
  
  // Verify index exists
  const indexExists = await queryRunner.query(\`
    SELECT EXISTS (
      SELECT FROM pg_indexes
      WHERE indexname = 'idx_users_email_verified'
    );
  \`);
  
  return result[0].exists && indexExists[0].exists;
};`;
    } else {
      return `import { QueryRunner } from 'typeorm';

export const up = async (queryRunner: QueryRunner): Promise<void> => {
  // Add new column
  await queryRunner.query(\`ALTER TABLE "users" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT FALSE\`);
  
  // Add index
  await queryRunner.query(\`CREATE INDEX "idx_users_email_verified" ON "users" ("email_verified")\`);
};

export const down = async (queryRunner: QueryRunner): Promise<void> => {
  // Drop index
  await queryRunner.query(\`DROP INDEX "idx_users_email_verified"\`);
  
  // Drop column
  await queryRunner.query(\`ALTER TABLE "users" DROP COLUMN "email_verified"\`);
};`;
    }
  }
  
  async generateDataMigration(tableName: string, options: { 
    transformFunction?: string;
    batchSize?: number;
  } = {}): Promise<string> {
    const timestamp = Date.now();
    const migrationName = `${timestamp}_data_migration_${tableName}`;
    const migrationsDir = this.config.migrationsDir || path.join(process.cwd(), 'migrations');
    
    // Ensure migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    const migrationFilePath = path.join(migrationsDir, `${migrationName}.ts`);
    
    // Generate migration content for data migration
    const batchSize = options.batchSize || 1000;
    const transformFunction = options.transformFunction || '(row) => row';
    
    const content = `import { QueryRunner } from 'typeorm';

/**
 * Data migration for table "${tableName}"
 * Processes data in batches of ${batchSize} rows to minimize locking
 */
export const up = async (queryRunner: QueryRunner): Promise<void> => {
  // Get total count of rows that need migration
  const countResult = await queryRunner.query(\`SELECT COUNT(*) as count FROM "${tableName}"\`);
  const totalRows = parseInt(countResult[0].count, 10);
  
  console.log(\`Starting data migration for ${totalRows} rows in "${tableName}"\`);
  
  // Process in batches
  let processedRows = 0;
  
  while (processedRows < totalRows) {
    // Begin transaction for this batch
    await queryRunner.startTransaction();
    
    try {
      // Get batch of rows
      const rows = await queryRunner.query(
        \`SELECT * FROM "${tableName}" ORDER BY id LIMIT ${batchSize} OFFSET ${processedRows}\`
      );
      
      // Apply transformation to each row
      for (const row of rows) {
        const transformedData = ${transformFunction};
        
        // Update row with transformed data
        await queryRunner.query(
          \`UPDATE "${tableName}" SET 
            field1 = $1,
            field2 = $2
          WHERE id = $3\`,
          [transformedData.field1, transformedData.field2, row.id]
        );
      }
      
      await queryRunner.commitTransaction();
      processedRows += rows.length;
      console.log(\`Processed ${processedRows}/${totalRows} rows\`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
  
  console.log(\`Completed data migration for "${tableName}"\`);
};

export const down = async (queryRunner: QueryRunner): Promise<void> => {
  // Data migrations often don't need down migrations,
  // or they require special handling based on your backup strategy
  console.log(\`Rollback not implemented for data migration on "${tableName}"\`);
};`;
    
    // Write migration file
    fs.writeFileSync(migrationFilePath, content);
    
    this.logger.log(`Generated data migration file: ${migrationFilePath}`);
    return migrationFilePath;
  }
  
}