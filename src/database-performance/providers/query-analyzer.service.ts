import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository, Connection } from "typeorm"
import { SlowQuery } from "../entities/slow-query.entity"

@Injectable()
export class QueryAnalyzerService {
  private readonly logger = new Logger(QueryAnalyzerService.name)
  private readonly SLOW_QUERY_THRESHOLD_MS = 100; // Queries slower than this are considered slow

  constructor(
    @InjectRepository(SlowQuery)
    private slowQueryRepository: Repository<SlowQuery>,
    private connection: Connection,
  ) { }

  /**
   * Analyze a query and get its execution plan
   */
  async analyzeQuery(
    queryText: string,
    params: any[] = [],
  ): Promise<{
    executionTimeMs: number
    explainPlan: string
    suggestedIndexes: string[]
  }> {
    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()

    try {
      // Get EXPLAIN plan
      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${queryText}`
      const startTime = Date.now()
      const explainResult = await queryRunner.query(explainQuery, params)
      const executionTimeMs = Date.now() - startTime

      const explainPlan = JSON.stringify(explainResult[0][0], null, 2)

      // Analyze the plan to suggest indexes
      const suggestedIndexes = this.suggestIndexes(explainResult[0][0], queryText)

      // If it's a slow query, save it
      if (executionTimeMs > this.SLOW_QUERY_THRESHOLD_MS) {
        await this.saveSlowQuery(queryText, executionTimeMs, explainPlan, suggestedIndexes)
      }

      return {
        executionTimeMs,
        explainPlan,
        suggestedIndexes,
      }
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Save a slow query for later analysis
   */
  private async saveSlowQuery(
    queryText: string,
    executionTimeMs: number,
    explainPlan: string,
    suggestedIndexes: string[],
  ): Promise<SlowQuery> {
    const slowQuery = new SlowQuery()
    slowQuery.queryText = queryText
    slowQuery.executionTimeMs = executionTimeMs
    slowQuery.explainPlan = explainPlan
    slowQuery.suggestedIndexes = suggestedIndexes.join(", ")

    // Extract table name from query (simplified)
    const tableMatch = queryText.match(/FROM\s+([^\s,]+)/i)
    if (tableMatch && tableMatch[1]) {
      slowQuery.tableName = tableMatch[1].replace(/[^a-zA-Z0-9_]/g, "")
    }

    return this.slowQueryRepository.save(slowQuery)
  }

  /**
   * Suggest indexes based on the explain plan
   */
  private suggestIndexes(explainPlan: any, queryText: string): string[] {
    const suggestedIndexes: string[] = []

    try {
      // Extract table and column information from the query
      const tableMatch = queryText.match(/FROM\s+([^\s,]+)/i)
      if (!tableMatch) return suggestedIndexes

      const tableName = tableMatch[1].replace(/[^a-zA-Z0-9_]/g, "")

      // Check for WHERE clauses
      const whereMatch = queryText.match(/WHERE\s+(.+?)(?:ORDER BY|GROUP BY|LIMIT|$)/is)
      if (whereMatch) {
        const whereClause = whereMatch[1]
        const columnMatches = whereClause.match(/([a-zA-Z0-9_]+)\s*(?:=|>|<|>=|<=|LIKE|IN)/g)

        if (columnMatches) {
          columnMatches.forEach((match) => {
            const column = match.trim().split(/\s+/)[0]
            suggestedIndexes.push(`CREATE INDEX idx_${tableName}_${column} ON ${tableName} (${column});`)
          })
        }
      }

      // Check for ORDER BY clauses
      const orderByMatch = queryText.match(/ORDER BY\s+(.+?)(?:LIMIT|$)/is)
      if (orderByMatch) {
        const orderByClause = orderByMatch[1]
        const columns = orderByClause.split(",").map((col) => col.trim().split(/\s+/)[0])

        if (columns.length > 0) {
          suggestedIndexes.push(
            `CREATE INDEX idx_${tableName}_${columns.join("_")} ON ${tableName} (${columns.join(", ")});`,
          )
        }
      }

      // Check for sequential scans in the explain plan
      this.findSequentialScans(explainPlan, tableName, suggestedIndexes)
    } catch (error) {
      this.logger.error(`Error suggesting indexes: ${error.message}`)
    }

    // Remove duplicates
    return [...new Set(suggestedIndexes)]
  }

  /**
   * Find sequential scans in the explain plan
   */
  private findSequentialScans(node: any, tableName: string, suggestedIndexes: string[]): void {
    if (!node) return

    if (node["Node Type"] === "Seq Scan" && node["Relation Name"]) {
      const scanTableName = node["Relation Name"]

      if (node["Filter"]) {
        const filter = node["Filter"]
        const columnMatches = filter.match(/\(([a-zA-Z0-9_]+)\s*(?:=|>|<|>=|<=|~~)/g)

        if (columnMatches) {
          columnMatches.forEach((match) => {
            const column = match.replace(/[^a-zA-Z0-9_]/g, "")
            suggestedIndexes.push(`CREATE INDEX idx_${scanTableName}_${column} ON ${scanTableName} (${column});`)
          })
        }
      }
    }

    // Recursively check child nodes
    if (node["Plans"] && Array.isArray(node["Plans"])) {
      node["Plans"].forEach((plan) => this.findSequentialScans(plan, tableName, suggestedIndexes))
    }
  }

  /**
   * Get slow queries for a specific time period
   */
  async getSlowQueries(startDate: Date, endDate: Date, tableName?: string): Promise<SlowQuery[]> {
    const query = this.slowQueryRepository
      .createQueryBuilder("slowQuery")
      .where("slowQuery.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })

    if (tableName) {
      query.andWhere("slowQuery.tableName = :tableName", { tableName })
    }

    return query.orderBy("slowQuery.executionTimeMs", "DESC").getMany()
  }

  /**
   * Generate migration script for suggested indexes
   */
  async generateIndexMigrations(): Promise<string> {
    const slowQueries = await this.slowQueryRepository.find({
      order: { executionTimeMs: "DESC" },
      take: 20,
    })

    const allSuggestedIndexes: string[] = []

    slowQueries.forEach((query) => {
      if (query.suggestedIndexes) {
        const indexes = query.suggestedIndexes.split(", ")
        allSuggestedIndexes.push(...indexes)
      }
    })

    // Remove duplicates
    const uniqueIndexes = [...new Set(allSuggestedIndexes)]

    // Generate migration script
    const migrationScript = `
-- Migration script for adding suggested indexes
-- Generated on ${new Date().toISOString()}

BEGIN;

${uniqueIndexes.join("\n\n")}

COMMIT;
    `

    return migrationScript
  }
}
