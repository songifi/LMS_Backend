export interface MigrationConfig {
    migrationsDir?: string;
    migrationsTableName?: string;
    migrationLockTableName?: string;
    migrationHistoryTableName?: string;
    enablePerformanceAnalysis?: boolean;
    enableDataVerification?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    enableConsistencyChecks?: boolean;
    abTestingEnabled?: boolean;
    rollbackOnFailure?: boolean;
    timeoutMs?: number;
    maxConcurrentConnections?: number;
  }