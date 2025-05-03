import { Injectable, Logger } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { PerformanceSnapshot } from '../interfaces/performanceSnapshot.interface';
import { TableStats } from '../interfaces/tableStats.interface';
import { IndexStats } from '../interfaces/indexStats.interface';
import { QueryPerformanceStats } from '../interfaces/queryPerformanceStats.interface';
import { PerformanceImpact } from '../interfaces/performanceImpact.interface';

@Injectable()
export class MigrationPerformanceService {
  private readonly logger = new Logger(MigrationPerformanceService.name);

  async capturePerformanceSnapshot(): Promise<PerformanceSnapshot> {
    const queryRunner = await this.getQueryRunner();
    
    try {
      const tableStats = await this.captureTableStats(queryRunner);
      const indexStats = await this.captureIndexStats(queryRunner);
      const queryStats = await this.captureQueryStats(queryRunner);
      
      return {
        timestamp: new Date(),
        tableStats,
        indexStats,
        queryStats
      };
    } finally {
      await queryRunner.release();
    }
  }
  
  private async getQueryRunner(): Promise<QueryRunner> {
    const connection = await this.getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    return queryRunner;
  }
  
  private async getConnection() {
    // This would normally be injected, but for brevity we'll use a placeholder
    return {
      createQueryRunner: () => ({
        connect: async () => {},
        release: async () => {},
        query: async (query: string) => {
          // Mock implementation that would execute the query
          return [];
        }
      })
    } as any;
  }
  
  private async captureTableStats(queryRunner: QueryRunner): Promise<Record<string, TableStats>> {
    const tables = await queryRunner.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    const result: Record<string, TableStats> = {};
    
    for (const table of tables) {
      const tableName = table.tablename;
      
      // Get table size
      const sizeResult = await queryRunner.query(`
        SELECT pg_total_relation_size('${tableName}') as size_bytes
      `);
      
      // Get row count (estimate)
      const rowCountResult = await queryRunner.query(`
        SELECT reltuples::bigint AS row_count
        FROM pg_class
        WHERE relname = '${tableName}'
      `);
      
      // Get throughput stats from pg_stat_user_tables
      const statsResult = await queryRunner.query(`
        SELECT 
          (n_tup_ins + n_tup_upd + n_tup_del) / 
            CASE WHEN extract(epoch from (now() - stats_reset)) = 0 
              THEN 1 
              ELSE extract(epoch from (now() - stats_reset)) 
            END as write_throughput,
          seq_scan * seq_tup_read / 
            CASE WHEN extract(epoch from (now() - stats_reset)) = 0 
              THEN 1 
              ELSE extract(epoch from (now() - stats_reset)) 
            END as read_throughput
        FROM pg_stat_user_tables
        WHERE relname = '${tableName}'
      `);
      
      result[tableName] = {
        tableName,
        rowCount: parseInt(rowCountResult[0]?.row_count || '0', 10),
        sizeBytes: parseInt(sizeResult[0]?.size_bytes || '0', 10),
        readThroughput: parseFloat(statsResult[0]?.read_throughput || '0'),
        writeThroughput: parseFloat(statsResult[0]?.write_throughput || '0')
      };
    }
    
    return result;
  }
  
  private async captureIndexStats(queryRunner: QueryRunner): Promise<Record<string, IndexStats>> {
    const indexStats = await queryRunner.query(`
      SELECT
        i.indexrelname as index_name,
        t.relname as table_name,
        i.idx_scan as usage_count,
        i.idx_tup_read as scan_count,
        pg_relation_size(format('%I.%I', t.schemaname, i.indexrelname)::regclass) as size_bytes
      FROM pg_stat_user_indexes i
      JOIN pg_stat_user_tables t ON i.relid = t.relid
      WHERE t.schemaname = 'public'
    `);
    
    const result: Record<string, IndexStats> = {};
    
    for (const stat of indexStats) {
      result[stat.index_name] = {
        indexName: stat.index_name,
        tableName: stat.table_name,
        usageCount: parseInt(stat.usage_count, 10),
        scanCount: parseInt(stat.scan_count, 10),
        sizeBytes: parseInt(stat.size_bytes, 10)
      };
    }
    
    return result;
  }
  
  private async captureQueryStats(queryRunner: QueryRunner): Promise<QueryPerformanceStats[]> {
    // Query pg_stat_statements for query performance data
    try {
      // Check if pg_stat_statements extension exists
      const extensionExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM pg_extension 
          WHERE extname = 'pg_stat_statements'
        );
      `);
      
      if (!extensionExists[0].exists) {
        this.logger.warn('pg_stat_statements extension not installed. Query performance monitoring unavailable.');
        return [];
      }
      
      const queryStats = await queryRunner.query(`
        SELECT 
          queryid, 
          regexp_replace(query, '[0-9]+', 'N', 'g') as query_pattern,
          mean_exec_time as avg_execution_time_ms,
          calls as call_count,
          rows as rows_processed
        FROM pg_stat_statements
        WHERE dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
        ORDER BY mean_exec_time DESC
        LIMIT 50
      `);
      
      return queryStats.map(stat => ({
        queryPattern: stat.query_pattern,
        avgExecutionTimeMs: parseFloat(stat.avg_execution_time_ms),
        callCount: parseInt(stat.call_count, 10),
        rowsProcessed: parseInt(stat.rows_processed, 10)
      }));
    } catch (error) {
      this.logger.warn('Failed to collect query performance stats', error.stack);
      return [];
    }
  }
  
  analyzePerformanceImpact(
    before: PerformanceSnapshot,
    after: PerformanceSnapshot
  ): PerformanceImpact {
    // Calculate table size growth
    const tableGrowth: Record<string, number> = {};
    for (const tableName in after.tableStats) {
      if (before.tableStats[tableName]) {
        const beforeSize = before.tableStats[tableName].sizeBytes;
        const afterSize = after.tableStats[tableName].sizeBytes;
        tableGrowth[tableName] = beforeSize === 0 ? 0 : ((afterSize - beforeSize) / beforeSize) * 100;
      }
    }
    
    // Calculate index size growth
    const indexGrowth: Record<string, number> = {};
    for (const indexName in after.indexStats) {
      if (before.indexStats[indexName]) {
        const beforeSize = before.indexStats[indexName].sizeBytes;
        const afterSize = after.indexStats[indexName].sizeBytes;
        indexGrowth[indexName] = beforeSize === 0 ? 0 : ((afterSize - beforeSize) / beforeSize) * 100;
      }
    }
    
    // Find queries that got slower or faster
    const queryPerformanceMap = new Map<string, number>();
    before.queryStats.forEach(stat => {
      queryPerformanceMap.set(stat.queryPattern, stat.avgExecutionTimeMs);
    });
    
    const slowedQueries: QueryPerformanceStats[] = [];
    const improvedQueries: QueryPerformanceStats[] = [];
    
    after.queryStats.forEach(afterStat => {
      const beforeTime = queryPerformanceMap.get(afterStat.queryPattern);
      if (beforeTime) {
        const change = afterStat.avgExecutionTimeMs - beforeTime;
        const percentChange = (change / beforeTime) * 100;
        
        if (percentChange > 10 && change > 5) { // Only significant changes
          slowedQueries.push(afterStat);
        } else if (percentChange < -10 && change < -5) {
          improvedQueries.push(afterStat);
        }
      }
    });
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    // Check for large table growth
    Object.entries(tableGrowth)
      .filter(([_, growth]) => growth > 20)
      .forEach(([tableName, growth]) => {
        recommendations.push(`Table ${tableName} grew by ${growth.toFixed(1)}%. Consider partitioning or archiving.`);
      });
    
    // Check for unused indexes
    Object.values(after.indexStats)
      .filter(stat => stat.usageCount === 0 && stat.sizeBytes > 1024 * 1024) // Larger than 1MB
      .forEach(stat => {
        recommendations.push(`Index ${stat.indexName} on ${stat.tableName} is unused but consumes ${(stat.sizeBytes / (1024 * 1024)).toFixed(1)}MB.`);
      });
    
    // Check for queries that need optimization
    slowedQueries
      .filter(stat => stat.avgExecutionTimeMs > 1000) // Slower than 1s
      .forEach(stat => {
        recommendations.push(`Query pattern "${stat.queryPattern.substring(0, 100)}..." slowed down to ${stat.avgExecutionTimeMs.toFixed(1)}ms. Consider optimization.`);
      });
    
    return {
      beforeSnapshot: before.timestamp,
      afterSnapshot: after.timestamp,
      tableGrowth,
      indexGrowth,
      slowedQueries,
      improvedQueries,
      recommendations
    };
  }
}
