import { Logger } from "@nestjs/common"
import { InjectConnection } from "@nestjs/typeorm"
import { Connection } from "typeorm"
import { ConfigService } from "@nestjs/config"

interface QueryPerformanceResult {
    query: string;
    executionTime: number;
    rows: number;
    planningTime?: number | null; // ✅ now allows null
    executionPlan?: any;
  }
  
export class QueryPerformanceService {
  private readonly logger = new Logger(QueryPerformanceService.name);

  constructor(
    @InjectConnection() private connection: Connection,
    private configService: ConfigService
  ) {}

  /**
   * Analyzes a SQL query for performance
   * @param query SQL query to analyze
   * @param parameters Queryparameters
   * @returns Performance analysis results
   */
  async analyzeQuery(query: string, parameters: any[] = []): Promise<QueryPerformanceResult> {
    const startTime = Date.now()

    try {
      // Execute the query and measure time
      const result = await this.connection.query(query, parameters)
      const executionTime = Date.now() - startTime

      // Get execution plan if enabled
      let executionPlan: any = null;
      let planningTime: number | null = null;
      
      if (this.configService.get("ENABLE_QUERY_ANALYSIS") === "true") {
        try {
          const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
          const explainResult = await this.connection.query(explainQuery, parameters);
      
          if (explainResult && explainResult[0] && explainResult[0][0]) {
            executionPlan = explainResult[0][0];
            planningTime = executionPlan?.Planning?.Time ?? null;
          }
        } catch (error) {
          this.logger.warn(`Failed to get execution plan: ${error.message}`);
        }
      }      

      return {
        query,
        executionTime,
        rows: Array.isArray(result) ? result.length : 0,
        planningTime,
        executionPlan,
      }
    } catch (error) {
      this.logger.error(`Query analysis failed: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * Identifies slow queries in the database
   * @param threshold Minimum execution time in ms to consider a query slow
   * @param limit Maximum number of queries to return
   * @returns List of slow queries
   */
  async identifySlowQueries(threshold = 1000, limit = 10): Promise<any[]> {
    try {
      // Query pg_stat_statements for slow queries
      const query = `
        SELECT 
          query,
          calls,
          total_time / calls as avg_time,
          rows / calls as avg_rows,
          100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
        FROM pg_stat_statements
        WHERE total_time / calls > $1
        ORDER BY avg_time DESC
        LIMIT $2
      `

      const result = await this.connection.query(query, [threshold, limit])
      return result
    } catch (error) {
      this.logger.error(`Failed to identify slow queries: ${error.message}`, error.stack)
      // Return empty array if pg_stat_statements is not available
      return []
    }
  }

  /**
   * Suggests indexes for improving query performance
   * @returns List of index suggestions
   */
  async suggestIndexes(): Promise<any[]> {
    try {
      // Query for missing indexes
      const query = `
        SELECT
          schemaname || '.' || relname as table,
          indexrelname as index,
          idx_scan as index_scans,
          seq_scan as sequential_scans,
          seq_tup_read as sequential_reads,
          idx_tup_fetch as index_reads,
          seq_tup_read / CASE WHEN seq_scan = 0 THEN 1 ELSE seq_scan END as avg_seq_tuples_per_scan,
          idx_tup_fetch / CASE WHEN idx_scan = 0 THEN 1 ELSE idx_scan END as avg_idx_tuples_per_scan,
          pg_size_pretty(pg_relation_size(schemaname || '.' || relname)) as table_size
        FROM pg_stat_user_tables
        WHERE seq_scan > 10 AND seq_scan > idx_scan
        ORDER BY seq_scan DESC
        LIMIT 10
      `

      const result = await this.connection.query(query)
      return result
    } catch (error) {
      this.logger.error(`Failed to suggest indexes: ${error.message}`, error.stack)
      return []
    }
  }

  /**
   * Gets database statistics
   * @returns Database statistics
   */
  async getDatabaseStats(): Promise<any> {
    try {
      // Query for database statistics
      const sizeQuery = `
        SELECT
          pg_database.datname as database_name,
          pg_size_pretty(pg_database_size(pg_database.datname)) as database_size
        FROM pg_database
        WHERE pg_database.datname = current_database()
      `

      const tableQuery = `
        SELECT
          schemaname || '.' || relname as table_name,
          pg_size_pretty(pg_total_relation_size(schemaname || '.' || relname)) as total_size,
          pg_size_pretty(pg_relation_size(schemaname || '.' || relname)) as table_size,
          pg_size_pretty(pg_total_relation_size(schemaname || '.' || relname) - pg_relation_size(schemaname || '.' || relname)) as index_size,
          n_live_tup as row_count
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname || '.' || relname) DESC
        LIMIT 10
      `

      const cacheQuery = `
        SELECT
          sum(heap_blks_read) as heap_read,
          sum(heap_blks_hit) as heap_hit,
          sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
        FROM pg_statio_user_tables
      `

      const [sizeResult, tableResult, cacheResult] = await Promise.all([
        this.connection.query(sizeQuery),
        this.connection.query(tableQuery),
        this.connection.query(cacheQuery),
      ])

      return {
        database: sizeResult[0],
        tables: tableResult,
        cacheHitRatio: cacheResult[0].cache_hit_ratio,
      }
    } catch (error) {
      this.logger.error(`Failed to get database stats: ${error.message}`, error.stack)
      return {}
    }
  }
}
