import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { MigrationEntity } from './entities/migration.entity';
import { MigrationLockEntity } from '../entities/migration-lock.entity';
import { MigrationHistoryEntity } from '../entities/migration-history.entity';
import { PostgresSpecificMigrationService } from './database-specific/postgres-migration.service';
import { MigrationVerificationService } from './verification/migration-verification.service';
import { MigrationPerformanceService } from './performance/migration-performance.service';
import { MigrationRollbackService } from './rollback/migration-rollback.service';
import { MigrationConfig } from '../interfaces/migration-config.interface';
import { MigrationStatus } from '../enums/migration-status.enum';
import { IMigration } from '../interfaces/migration.interface';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectRepository(MigrationEntity)
    private migrationRepository: Repository<MigrationEntity>,
    @InjectRepository(MigrationLockEntity)
    private lockRepository: Repository<MigrationLockEntity>,
    @InjectRepository(MigrationHistoryEntity)
    private historyRepository: Repository<MigrationHistoryEntity>,
    private connection: Connection,
    private postgresService: PostgresSpecificMigrationService,
    private verificationService: MigrationVerificationService,
    private performanceService: MigrationPerformanceService,
    private rollbackService: MigrationRollbackService,
    @Inject('MIGRATION_CONFIG') private config: MigrationConfig,
  ) {}

  async applyMigrations(options: { 
    dryRun?: boolean, 
    single?: string, 
    verifyOnly?: boolean 
  } = {}): Promise<void> {
    // Acquire lock to prevent concurrent migrations
    await this.acquireLock();
    
    try {
      // Get all pending migrations
      const pendingMigrations = await this.getPendingMigrations(options.single);
      
      if (pendingMigrations.length === 0) {
        this.logger.log('No pending migrations found');
        return;
      }

      this.logger.log(`Found ${pendingMigrations.length} pending migrations`);
      
      if (options.verifyOnly) {
        await this.verifyMigrations(pendingMigrations);
        return;
      }

      // Run each migration
      for (const migration of pendingMigrations) {
        await this.runMigration(migration, options.dryRun);
      }
    } finally {
      // Always release lock
      await this.releaseLock();
    }
  }
  
  private async acquireLock(): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Use advisory locks in PostgreSQL for zero contention
      if (this.connection.options.type === 'postgres') {
        await queryRunner.query('SELECT pg_advisory_lock(1234567890)');
      }
      
      // Also use our application lock table as a backup
      await this.lockRepository.save({
        id: 1,
        locked: true,
        lockedAt: new Date()
      });
      
      this.logger.log('Migration lock acquired');
    } catch (error) {
      this.logger.error('Failed to acquire migration lock', error.stack);
      throw new Error('Could not acquire migration lock. Is another migration in progress?');
    } finally {
      await queryRunner.release();
    }
  }
  
  private async releaseLock(): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Release PostgreSQL advisory lock
      if (this.connection.options.type === 'postgres') {
        await queryRunner.query('SELECT pg_advisory_unlock(1234567890)');
      }
      
      // Also release our application lock
      await this.lockRepository.update(1, {
        locked: false,
        lockedAt: null
      });
      
      this.logger.log('Migration lock released');
    } catch (error) {
      this.logger.error('Failed to release migration lock', error.stack);
    } finally {
      await queryRunner.release();
    }
  }
  
  private async getPendingMigrations(single?: string): Promise<IMigration[]> {
    // Get all executed migrations
    const executedMigrations = await this.migrationRepository.find();
    const executedNames = new Set(executedMigrations.map(m => m.name));
    
    // Read migration files from the configured directory
    const migrationsDir = this.config.migrationsDir || path.join(process.cwd(), 'migrations');
    const fileNames = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') || file.endsWith('.ts'));
    
    // Filter and sort migrations
    const pendingMigrations = fileNames
      .filter(file => !executedNames.has(path.parse(file).name))
      .filter(file => !single || path.parse(file).name === single)
      .sort()
      .map(file => {
        const filePath = path.join(migrationsDir, file);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const migration = require(filePath);
        return {
          name: path.parse(file).name,
          up: migration.up,
          down: migration.down,
          safeUp: migration.safeUp,
          safeDown: migration.safeDown,
          checksum: this.calculateChecksum(filePath),
          filePath
        };
      });
      
    return pendingMigrations;
  }
  
  private calculateChecksum(filePath: string): string {
    const content = fs.readFileSync(filePath);
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }
  
  private async runMigration(migration: IMigration, dryRun = false): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      this.logger.log(`Running migration: ${migration.name}`);
      
      // Performance analysis before migration
      const perfSnapshotBefore = await this.performanceService.capturePerformanceSnapshot();
      
      // Check if this is a safe migration that can be applied with zero downtime
      const isSafeMigration = typeof migration.safeUp === 'function';
      
      // Start timer for migration duration
      const startTime = Date.now();
      
      if (dryRun) {
        this.logger.log(`[DRY RUN] Would execute migration: ${migration.name}`);
      } else {
        // Use zero-downtime migration strategy if available
        if (isSafeMigration) {
          await this.executeZeroDowntimeMigration(migration, queryRunner);
        } else {
          // Standard migration
          await migration.up(queryRunner);
        }
        
        // Verify data consistency after migration
        const isConsistent = await this.verificationService.verifyDataConsistency(queryRunner, migration);
        if (!isConsistent) {
          throw new Error(`Data consistency check failed for migration ${migration.name}`);
        }
        
        // Record the migration
        await this.migrationRepository.save({
          name: migration.name,
          executedAt: new Date(),
          duration: Date.now() - startTime,
          checksum: migration.checksum,
          status: MigrationStatus.COMPLETED
        });
      }
      
      // Performance analysis after migration
      const perfSnapshotAfter = await this.performanceService.capturePerformanceSnapshot();
      const perfImpact = this.performanceService.analyzePerformanceImpact(
        perfSnapshotBefore,
        perfSnapshotAfter
      );
      
      // Log performance impact
      this.logger.log(`Migration performance impact for ${migration.name}:`);
      this.logger.log(JSON.stringify(perfImpact, null, 2));
      
      await queryRunner.commitTransaction();
      this.logger.log(`Migration completed: ${migration.name}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (!dryRun) {
        // Record failed migration
        await this.migrationRepository.save({
          name: migration.name,
          executedAt: new Date(),
          duration: Date.now() - startTime,
          checksum: migration.checksum,
          status: MigrationStatus.FAILED,
          errorMessage: error.message
        });
        
        // Try to rollback if possible
        if (typeof migration.down === 'function' || typeof migration.safeDown === 'function') {
          await this.rollbackService.rollbackMigration(migration);
        }
      }
      
      this.logger.error(`Failed to execute migration ${migration.name}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  private async executeZeroDowntimeMigration(migration: IMigration, queryRunner: QueryRunner): Promise<void> {
    // Step 1: Deploy new code that can handle both old and new schema
    // (This is assumed to be done before the migration is run)
    
    // Step 2: Execute the safe migration steps
    await migration.safeUp(queryRunner);
    
    // Step 3: Update dual-write logic to write to both old and new schema if needed
    // (This would be part of the application code or migration.safeUp implementation)
    
    // Step 4: Verify data consistency between old and new schemas
    await this.verificationService.verifyDataConsistency(queryRunner, migration);
  }
  
  async verifyMigrations(migrations: IMigration[]): Promise<boolean> {
    let allValid = true;
    
    for (const migration of migrations) {
      const isValid = await this.verificationService.validateMigration(migration);
      if (!isValid) {
        allValid = false;
        this.logger.error(`Migration validation failed: ${migration.name}`);
      } else {
        this.logger.log(`Migration validation passed: ${migration.name}`);
      }
    }
    
    return allValid;
  }
  
  async rollbackLastMigration(): Promise<void> {
    await this.acquireLock();
    
    try {
      const lastMigration = await this.migrationRepository.findOne({
        order: { executedAt: 'DESC' }
      });
      
      if (!lastMigration) {
        this.logger.log('No migrations to rollback');
        return;
      }
      
      await this.rollbackService.rollbackMigration(lastMigration.name);
    } finally {
      await this.releaseLock();
    }
  }
  
  async getExecutedMigrations(): Promise<MigrationEntity[]> {
    return this.migrationRepository.find({
      order: { executedAt: 'ASC' }
    });
  }
  
  async getMigrationHistory(): Promise<MigrationHistoryEntity[]> {
    return this.historyRepository.find({
      order: { timestamp: 'DESC' },
      take: 100
    });
  }
}
