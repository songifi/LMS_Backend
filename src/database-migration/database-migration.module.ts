import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MigrationService } from './migration.service';
import { MigrationController } from './migration.controller';
import { MigrationEntity } from './entities/migration.entity';
import { MigrationLockEntity } from './entities/migration-lock.entity';
import { MigrationHistoryEntity } from './entities/migration-history.entity';
import { MigrationGenerator } from './generators/migration-generator.service';
import { PostgresSpecificMigrationService } from './database-specific/postgres-migration.service';
import { MigrationVerificationService } from './verification/migration-verification.service';
import { MigrationPerformanceService } from './performance/migration-performance.service';
import { MigrationRollbackService } from './rollback/migration-rollback.service';
import { MigrationCliService } from './cli/migration-cli.service';
import { MigrationConfig } from './interfaces/migration-config.interface';

@Module({})
export class MigrationModule {
  static register(options: MigrationConfig): DynamicModule {
    return {
      module: MigrationModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forFeature([
          MigrationEntity,
          MigrationLockEntity,
          MigrationHistoryEntity,
        ]),
      ],
      providers: [
        {
          provide: 'MIGRATION_CONFIG',
          useValue: options,
        },
        MigrationService,
        MigrationGenerator,
        PostgresSpecificMigrationService,
        MigrationVerificationService,
        MigrationPerformanceService,
        MigrationRollbackService,
        MigrationCliService,
      ],
      controllers: [MigrationController],
      exports: [
        MigrationService,
        MigrationGenerator,
        PostgresSpecificMigrationService,
        MigrationVerificationService,
        MigrationPerformanceService,
        MigrationRollbackService,
        MigrationCliService,
      ],
    };
  }
}