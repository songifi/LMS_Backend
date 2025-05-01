import { Injectable, Logger } from '@nestjs/common';
import { Connection, QueryRunner } from 'typeorm';

@Injectable()
export class PostgresSpecificMigrationService {
  private readonly logger = new Logger(PostgresSpecificMigrationService.name);

  constructor(private connection: Connection) {
    if (connection.options.type !== 'postgres') {
      this.logger.warn('PostgreSQL specific features are enabled but database is not PostgreSQL');
    }
  }

  async createConcurrencyControlledTransaction(isolationLevel = 'READ COMMITTED'): Promise<QueryRunner> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(isolationLevel);
    return queryRunner;
  }

  async addColumn(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    columnDefinition: string,
  ): Promise<void> {
    // Check if column exists
    const columnExists = await this.columnExists(queryRunner, tableName, columnName);
    if (columnExists) {
      this.logger.log(`Column ${columnName} already exists in table ${tableName}`);
      return;
    }

    // Add column with default value (if provided)
    await queryRunner.query(`ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${columnDefinition}`);
  }

  async renameColumn(
    queryRunner: QueryRunner,
    tableName: string,
    oldColumnName: string,
    newColumnName: string,
  ): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${tableName}" RENAME COLUMN "${oldColumnName}" TO "${newColumnName}"`,
    );
  }

  async createIndex(
    queryRunner: QueryRunner,
    tableName: string,
    columnNames: string[],
    indexName?: string,
    concurrently = true,
  ): Promise<void> {
    const indexNameToUse = indexName || `idx_${tableName}_${columnNames.join('_')}`;
    const concurrentlyClause = concurrently ? 'CONCURRENTLY' : '';
    
    // Check if index exists
    const indexExists = await this.indexExists(queryRunner, indexNameToUse);
    if (indexExists) {
      this.logger.log(`Index ${indexNameToUse} already exists`);
      return;
    }
    
    await queryRunner.query(
      `CREATE INDEX ${concurrentlyClause} "${indexNameToUse}" ON "${tableName}" (${columnNames.map(c => `"${c}"`).join(', ')})`,
    );
  }

  async addNotNullConstraint(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<void> {
    // First check all rows have non-null values
    const result = await queryRunner.query(
      `SELECT COUNT(*) FROM "${tableName}" WHERE "${columnName}" IS NULL`,
    );
    
    const count = parseInt(result[0].count, 10);
    if (count > 0) {
      throw new Error(`Cannot add NOT NULL constraint to ${tableName}.${columnName}: ${count} null values found`);
    }
    
    // Add NOT NULL constraint
    await queryRunner.query(
      `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET NOT NULL`,
    );
  }

  async createTriggerFunction(
    queryRunner: QueryRunner,
    functionName: string,
    functionBody: string,
  ): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION ${functionName}()
      RETURNS TRIGGER AS $$
      BEGIN
        ${functionBody}
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  async createTrigger(
    queryRunner: QueryRunner,
    triggerName: string,
    tableName: string,
    functionName: string,
    timing: 'BEFORE' | 'AFTER' | 'INSTEAD OF',
    events: Array<'INSERT' | 'UPDATE' | 'DELETE'>,
    condition?: string,
  ): Promise<void> {
    const eventString = events.join(' OR ');
    const conditionClause = condition ? `WHEN (${condition})` : '';
    
    await queryRunner.query(`
      CREATE TRIGGER ${triggerName}
      ${timing} ${eventString} ON "${tableName}"
      ${conditionClause}
      EXECUTE FUNCTION ${functionName}();
    `);
  }
  
  async addForeignKey(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    referencedTableName: string,
    referencedColumnName: string,
    onDelete = 'NO ACTION',
    onUpdate = 'NO ACTION',
    constraintName?: string,
  ): Promise<void> {
    const name = constraintName || `fk_${tableName}_${columnName}`;
    
    await queryRunner.query(`
      ALTER TABLE "${tableName}" ADD CONSTRAINT "${name}"
      FOREIGN KEY ("${columnName}")
      REFERENCES "${referencedTableName}" ("${referencedColumnName}")
      ON DELETE ${onDelete} ON UPDATE ${onUpdate}
    `);
  }
  
  async tableExists(queryRunner: QueryRunner, tableName: string): Promise<boolean> {
    const result = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = '${tableName}'
      );
    `);
    
    return result[0].exists;
  }
  
  async columnExists(queryRunner: QueryRunner, tableName: string, columnName: string): Promise<boolean> {
    const result = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
        AND column_name = '${columnName}'
      );
    `);
    
    return result[0].exists;
  }
  
  async indexExists(queryRunner: QueryRunner, indexName: string): Promise<boolean> {
    const result = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname = '${indexName}'
      );
    `);
    
    return result[0].exists;
  }
  
  async createExtension(queryRunner: QueryRunner, extensionName: string): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "${extensionName}"`);
  }
  
  async getTableSize(queryRunner: QueryRunner, tableName: string): Promise<string> {
    const result = await queryRunner.query(`
      SELECT pg_size_pretty(pg_total_relation_size('${tableName}')) as size;
    `);
    
    return result[0].size;
  }
  
  async getTableRowCount(queryRunner: QueryRunner, tableName: string): Promise<number> {
    const result = await queryRunner.query(`
      SELECT reltuples::bigint as estimate
      FROM pg_class
      WHERE relname = '${tableName}';
    `);
    
    return parseInt(result[0].estimate, 10);
  }
}
