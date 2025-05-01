import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, QueryRunner } from 'typeorm';
import * as path from 'path';
import { MigrationEntity } from '../entities/migration.entity';
import { MigrationHistoryEntity } from '../entities/migration-history.entity';
import { MigrationOperation } from '../enums/migration-operation.enum';
import { MigrationStatus } from '../enums/migration-status.enum';
import { MigrationConfig } from '../interfaces/migration-config.interface';
import { IMigration } from '../interfaces/migration.interface';

@Injectable()
export class MigrationRollbackService {
  private readonly logger = new Logger(MigrationRollbackService.name);

  constructor(
    @InjectRepository(MigrationEntity)
    private migrationRepository: Repository<MigrationEntity>,
    @InjectRepository(MigrationHistoryEntity)
    private historyRepository: Repository<MigrationHistoryEntity>,
    private connection: Connection,
    @Inject('MIGRATION_CONFIG') private config: MigrationConfig,
  ) {}

  async rollbackMigration(migrationNameOrEntity: string | MigrationEntity): Promise<void> {
    let migrationEntity: MigrationEntity;
    
    if (typeof migrationNameOrEntity === 'string') {
      const foundMigration = await this.migrationRepository.findOne({
        where: { name: migrationNameOrEntity }
      });
      
      if (!foundMigration) {
        throw new Error(`Migration "${migrationNameOrEntity}" not found in the database`);
      }
      
      migrationEntity = foundMigration;
    } else {
      migrationEntity = migrationNameOrEntity;
    }
    
    // Load the migration file
    const migration = await this.loadMigrationFile(migrationEntity.name);
    
    // Check if rollback is possible
    if (!migration.down && !migration.safeDown) {
      throw new Error(`Migration "${migrationEntity.name}" does not have rollback methods (down/safeDown)`);
    }
    
    // Start rollback process
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      this.logger.log(`Rolling back migration: ${migrationEntity.name}`);
      
      const startTime = Date.now();
      
      // Use zero-downtime rollback if available
      if (typeof migration.safeDown === 'function') {
        await this.executeZeroDowntimeRollback(migration, queryRunner);
      } else {
        // Standard rollback
        await migration.down(queryRunner);
      }
      
      // Update migration status
      await this.migrationRepository.update(migrationEntity.name, {
        status: MigrationStatus.ROLLED_BACK
      });
      
      // Record rollback history
      await this.historyRepository.save({
        migrationName: migrationEntity.name,
        operation: MigrationOperation.ROLLBACK,
        timestamp: new Date(),
        metadata: {
          duration: Date.now() - startTime,
          checksum: migrationEntity.checksum
        }
      });
      
      await queryRunner.commitTransaction();
      this.logger.log(`Successfully rolled back migration: ${migrationEntity.name}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      // Record failed rollback
      await this.historyRepository.save({
        migrationName: migrationEntity.name,
        operation: MigrationOperation.ROLLBACK,
        timestamp: new Date(),
        errorMessage: error.message
      });
      
      this.logger.error(`Failed to rollback migration ${migrationEntity.name}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  private async loadMigrationFile(migrationName: string): Promise<IMigration> {
    const migrationsDir = this.config.migrationsDir || path.join(process.cwd(), 'migrations');
    const filePath = path.join(migrationsDir, `${migrationName}.js`);
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const migration = require(filePath);
      
      return {
        name: migrationName,
        filePath,
        checksum: this.calculateChecksum(filePath),
        up: migration.up,
        down: migration.down,
        safeUp: migration.safeUp,
        safeDown: migration.safeDown,
        verify: migration.verify
      };
    } catch (error) {
      this.logger.error(`Failed to load migration file: ${filePath}`, error.stack);
      throw new Error(`Could not load migration file for ${migrationName}`);
    }
  }
  
  private calculateChecksum(filePath: string): string {
    const content = require('fs').readFileSync(filePath);
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }
  
  private async executeZeroDowntimeRollback(migration: IMigration, queryRunner: QueryRunner): Promise<void> {
    // Step 1: Execute the safe rollback steps
    await migration.safeDown(queryRunner);
    
    // Step 2: Verify data consistency after rollback
    if (typeof migration.verify === 'function') {
      const isConsistent = await migration.verify(queryRunner);
      if (!isConsistent) {
        throw new Error(`Data consistency check failed after rolling back migration ${migration.name}`);
      }
    }
  }
  
  async rollbackToMigration(targetMigrationName: string): Promise<void> {
    // Get all applied migrations in reverse order
    const appliedMigrations = await this.migrationRepository.find({
      where: { status: MigrationStatus.COMPLETED },
      order: { executedAt: 'DESC' }
    });
    
    if (appliedMigrations.length === 0) {
      this.logger.log('No migrations to rollback');
      return;
    }
    
    // Find target migration index
    const targetIndex = appliedMigrations.findIndex(m => m.name === targetMigrationName);
    
    if (targetIndex === -1) {
      throw new Error(`Target migration "${targetMigrationName}" not found or not applied`);
    }
    
    // Rollback all migrations after the target (inclusive if specified)
    const migrationsToRollback = appliedMigrations.slice(0, targetIndex);
    
    if (migrationsToRollback.length === 0) {
      this.logger.log(`No migrations to rollback (already at ${targetMigrationName})`);
      return;
    }
    
    this.logger.log(`Rolling back ${migrationsToRollback.length} migrations to reach ${targetMigrationName}`);
    
    // Roll them back one by one
    for (const migration of migrationsToRollback) {
      await this.rollbackMigration(migration);
    }
  }
  
  async rollbackLastBatch(): Promise<void> {
    // Group migrations by executedAt date (rounded to minutes to handle batch concept)
    const migrations = await this.migrationRepository.find({
      where: { status: MigrationStatus.COMPLETED },
      order: { executedAt: 'DESC' }
    });
    
    if (migrations.length === 0) {
      this.logger.log('No migrations to rollback');
      return;
    }
    
    // Group by batch (using date rounded to minute)
    const batches = new Map<string, MigrationEntity[]>();
    
    migrations.forEach(migration => {
      const batchTime = new Date(migration.executedAt);
      batchTime.setSeconds(0, 0); // Round to minute
      const batchKey = batchTime.toISOString();
      
      if (!batches.has(batchKey)) {
        batches.set(batchKey, []);
      }
      
      batches.get(batchKey).push(migration);
    });
    
    // Get the latest batch
    const batchTimes = Array.from(batches.keys()).sort().reverse();
    const latestBatch = batches.get(batchTimes[0]);
    
    this.logger.log(`Rolling back last batch with ${latestBatch.length} migrations`);
    
    // Roll them back in reverse order
    const sortedBatch = latestBatch.sort((a, b) => 
      b.executedAt.getTime() - a.executedAt.getTime()
    );
    
    for (const migration of sortedBatch) {
      await this.rollbackMigration(migration);
    }
  }
}