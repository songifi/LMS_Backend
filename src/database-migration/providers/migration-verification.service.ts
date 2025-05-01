import { Injectable, Logger } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { IMigration } from '../interfaces/migration.interface';

@Injectable()
export class MigrationVerificationService {
  private readonly logger = new Logger(MigrationVerificationService.name);

  async validateMigration(migration: IMigration): Promise<boolean> {
    // Check if migration has both up and down methods
    if (typeof migration.up !== 'function') {
      this.logger.error(`Migration ${migration.name} is missing 'up' method`);
      return false;
    }
    
    if (typeof migration.down !== 'function') {
      this.logger.warn(`Migration ${migration.name} is missing 'down' method. Rollback won't be possible.`);
      // Not a hard failure, but worth noting
    }
    
    // Check if this is a safe migration (for zero downtime)
    const isSafeMigration = typeof migration.safeUp === 'function';
    if (isSafeMigration && typeof migration.safeDown !== 'function') {
      this.logger.warn(`Migration ${migration.name} has safeUp but no safeDown. Safe rollback won't be possible.`);
    }
    
    // If migration has its own verification method, consider it valid
    // (actual verification will happen during execution)
    if (typeof migration.verify === 'function') {
      return true;
    }
    
    // Basic static analysis of SQL statements
    try {
      const fs = require('fs');
      const content = fs.readFileSync(migration.filePath, 'utf8');
      
      // Check for potential issues in migration
      const potentialIssues = this.analyzeForPotentialIssues(content);
      
      if (potentialIssues.length > 0) {
        this.logger.warn(`Migration ${migration.name} has potential issues:`);
        potentialIssues.forEach(issue => this.logger.warn(` - ${issue}`));
        // These are warnings, not hard failures
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to analyze migration ${migration.name}`, error.stack);
      return false;
    }
  }
  
  private analyzeForPotentialIssues(content: string): string[] {
    const issues: string[] = [];
    
    // Check for operations that might cause downtime
    if (/ALTER\s+TABLE.*ADD\s+CONSTRAINT.*NOT\s+NULL/i.test(content)) {
      issues.push('Adding NOT NULL constraint can cause table rewrites and lock tables');
    }
    
    if (/DROP\s+TABLE/i.test(content)) {
      issues.push('DROP TABLE found - ensure this is intentional');
    }
    
    // Check for large table operations without CONCURRENTLY
    if (/CREATE\s+INDEX(?!\s+CONCURRENTLY)/i.test(content)) {
      issues.push('Creating index without CONCURRENTLY can lock tables');
    }
    
    // Check for heavy operations
    if (/UPDATE\s+.+WHERE/i.test(content) && !/LIMIT/i.test(content)) {
      issues.push('Unbounded UPDATE found - consider using batching');
    }
    
    return issues;
  }
  
  async verifyDataConsistency(queryRunner: QueryRunner, migration: IMigration): Promise<boolean> {
    // If the migration has its own verification method, use it
    if (typeof migration.verify === 'function') {
      const isValid = await migration.verify(queryRunner);
      if (!isValid) {
        this.logger.error(`Custom verification failed for migration ${migration.name}`);
        return false;
      }
      return true;
    }
    
    // Default verification logic - check if all foreign keys are valid
    try {
      // Check foreign key constraints
      const result = await queryRunner.query(`
        SELECT conname, conrelid::regclass AS table_name, pg_get_constraintdef(oid) AS constraint_def
        FROM pg_constraint
        WHERE contype = 'f' AND connamespace = 'public'::regnamespace
        ORDER BY conrelid::regclass::text, conname;
      `);
      
      // For each foreign key, validate that the references are correct
      for (const fk of result) {
        // Extract table and referenced table from constraint definition
        const match = fk.constraint_def.match(/FOREIGN KEY \((.*?)\) REFERENCES (.*?)\((.*?)\)/i);
        if (!match) continue;
        
        const [, columns, refTable, refColumns] = match;
        
        // Check for orphaned records (simplified, real check would be more complex)
        const checkQuery = `
          SELECT COUNT(*) FROM ${fk.table_name} t
          LEFT JOIN ${refTable} r ON t.${columns.trim()} = r.${refColumns.trim()}
          WHERE r.${refColumns.trim()} IS NULL AND t.${columns.trim()} IS NOT NULL;
        `;
        
        try {
          const orphanedCheck = await queryRunner.query(checkQuery);
          const orphanedCount = parseInt(orphanedCheck[0].count, 10);
          
          if (orphanedCount > 0) {
            this.logger.error(
              `Data consistency error: Found ${orphanedCount} orphaned records in ${fk.table_name} referencing ${refTable}`
            );
            return false;
          }
        } catch (error) {
          // If query fails (e.g., column doesn't exist anymore), skip this check
          this.logger.warn(`Could not verify foreign key ${fk.conname}: ${error.message}`);
        }
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to verify data consistency`, error.stack);
      return false;
    }
  }
  
}