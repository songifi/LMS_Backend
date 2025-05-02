import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RetentionPolicyJob {
  private readonly logger = new Logger(RetentionPolicyJob.name);
  
  constructor(
    private connection: Connection,
    private retentionPolicyService: RetentionPolicyService,
    private anonymizationService: AnonymizationService,
    private dataInventoryService: DataInventoryService,
  ) {}
  
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async enforceRetentionPolicies() {
    this.logger.log('Starting retention policy enforcement job');
    
    // Get all active retention policies
    const policies = await this.retentionPolicyService.findAll();
    const activePolicies = policies.filter(p => p.isActive);
    
    if (activePolicies.length === 0) {
      this.logger.log('No active retention policies found');
      return;
    }
    
    this.logger.log(`Found ${activePolicies.length} active retention policies to enforce`);
    
    for (const policy of activePolicies) {
      await this.enforcePolicy(policy);
    }
    
    this.logger.log('Retention policy enforcement job completed');
  }
  
  private async enforcePolicy(policy: RetentionPolicyEntity) {
    this.logger.log(`Enforcing retention policy: ${policy.name} for ${policy.entityName}`);
    
    try {
      // Get entity info
      const inventory = await this.dataInventoryService.findByEntityName(policy.entityName);
      if (!inventory) {
        this.logger.error(`Entity ${policy.entityName} not found in data inventory`);
        return;
      }
      
      const tableName = inventory.tableName;
      const queryRunner = this.connection.createQueryRunner();
      
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        // Calculate the cutoff date based on retention period
        const now = new Date();
        const cutoffDate = new Date();
        
        switch (policy.retentionPeriodUnit) {
          case RetentionPeriodUnit.DAYS:
            cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriod);
            break;
          case RetentionPeriodUnit.MONTHS:
            cutoffDate.setMonth(cutoffDate.getMonth() - policy.retentionPeriod);
            break;
          case RetentionPeriodUnit.YEARS:
            cutoffDate.setFullYear(cutoffDate.getFullYear() - policy.retentionPeriod);
            break;
          case RetentionPeriodUnit.INDEFINITE:
            this.logger.log(`Policy ${policy.name} has indefinite retention, skipping`);
            continue;
        }
        
        // Build the WHERE clause
        let whereClause = `created_at < '${cutoffDate.toISOString()}'`;
        
        if (policy.condition) {
          whereClause += ` AND (${policy.condition})`;
        }
        
        // Count records to be processed
        const countResult = await queryRunner.manager.query(
          `SELECT COUNT(*) as count FROM "${tableName}" WHERE ${whereClause}`
        );
        
        const count = parseInt(countResult[0].count, 10);
        
        if (count === 0) {
          this.logger.log(`No records to process for policy ${policy.name}`);
          await queryRunner.commitTransaction();
          await queryRunner.release();
          continue;
        }
        
        this.logger.log(`Found ${count} records to process for policy ${policy.name}`);
        
        // Process based on action type
        const { action, strategy } = policy.actionOnExpiry;
        
        if (action === 'delete') {
          // Delete the records
          const deleteResult = await queryRunner.manager.query(
            `DELETE FROM "${tableName}" WHERE ${whereClause}`
          );
          
          this.logger.log(`Deleted ${deleteResult[1]} records for policy ${policy.name}`);
        } else if (action === 'anonymize') {
          // Get the fields to anonymize (all personal data fields)
          const personalDataFields = inventory.fields
            .filter(field => field.personalData)
            .map(field => field.fieldName);
            
          if (personalDataFields.length === 0) {
            this.logger.log(`No personal data fields to anonymize for policy ${policy.name}`);
            await queryRunner.commitTransaction();
            await queryRunner.release();
            continue;
          }
          
          // Get record IDs to process
          const records = await queryRunner.manager.query(
            `SELECT id FROM "${tableName}" WHERE ${whereClause}`
          );
          
          // Anonymize each record
          for (const record of records) {
            await this.anonymizationService.anonymizeRecord(
              policy.entityName,
              record.id,
              personalDataFields,
              strategy || 'pseudonymize',
              'system-retention-job'
            );
          }
          
          this.logger.log(`Anonymized ${records.length} records for policy ${policy.name}`);
        } else if (action === 'archive') {
          // Archive implementation would depend on your archiving strategy
          // Here's a simple example that moves data to an archive table
          
          // Check if archive table exists, create if not
          const archiveTableName = `${tableName}_archive`;
          const tableExists = await queryRunner.manager.query(
            `SELECT to_regclass('${archiveTableName}') IS NOT NULL as exists`
          );
          
          if (!tableExists[0].exists) {
            // Create archive table with same structure
            await queryRunner.manager.query(
              `CREATE TABLE "${archiveTableName}" AS TABLE "${tableName}" WITH NO DATA`
            );
            
            // Add archive_date column
            await queryRunner.manager.query(
              `ALTER TABLE "${archiveTableName}" ADD COLUMN archived_at TIMESTAMP DEFAULT now()`
            );
          }
          
          // Move records to archive
          await queryRunner.manager.query(
            `INSERT INTO "${archiveTableName}" 
             SELECT *, now() as archived_at 
             FROM "${tableName}" 
             WHERE ${whereClause}`
          );
          
          // Delete from original table
          const deleteResult = await queryRunner.manager.query(
            `DELETE FROM "${tableName}" WHERE ${whereClause}`
          );
          
          this.logger.log(`Archived ${deleteResult[1]} records for policy ${policy.name}`);
        }
        
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`Error enforcing policy ${policy.name}: ${err.message}`);
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (err) {
      this.logger.error(`Failed to enforce policy ${policy.name}: ${err.message}`);
    }
  }
}
