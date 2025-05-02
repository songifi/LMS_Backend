import { Injectable, Logger } from "@nestjs/common"
import type { Repository, Connection } from "typeorm"
import { PerformanceMetric } from "../entities/performance-metric.entity"

@Injectable()
export class BenchmarkService {
  private readonly logger = new Logger(BenchmarkService.name)

  constructor(
    private performanceMetricRepository: Repository<PerformanceMetric>,
    private connection: Connection,
  ) {}

  /**
   * Benchmark a query with specified concurrency
   */
  async benchmarkQuery(
    queryName: string,
    queryText: string,
    concurrentUsers: number,
    params: any[] = [],
  ): Promise<PerformanceMetric> {
    const startTime = Date.now()

    // Execute query
    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()

    try {
      await queryRunner.query(queryText, params)
      const executionTimeMs = Date.now() - startTime

      // Save metrics
      const metric = new PerformanceMetric()
      metric.queryName = queryName
      metric.queryText = queryText
      metric.executionTimeMs = executionTimeMs
      metric.concurrentUsers = concurrentUsers

      // Extract table name from query (simplified)
      const tableMatch = queryText.match(/FROM\s+([^\s,]+)/i)
      if (tableMatch && tableMatch[1]) {
        metric.tableName = tableMatch[1].replace(/[^a-zA-Z0-9_]/g, "")
      }

      // Determine operation type
      if (queryText.trim().toUpperCase().startsWith("SELECT")) {
        metric.operationType = "SELECT"
      } else if (queryText.trim().toUpperCase().startsWith("INSERT")) {
        metric.operationType = "INSERT"
      } else if (queryText.trim().toUpperCase().startsWith("UPDATE")) {
        metric.operationType = "UPDATE"
      } else if (queryText.trim().toUpperCase().startsWith("DELETE")) {
        metric.operationType = "DELETE"
      }

      await this.performanceMetricRepository.save(metric)
      return metric
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Run a benchmark suite with multiple queries
   */
  async runBenchmarkSuite(
    queries: Array<{ name: string; query: string; params?: any[] }>,
    concurrentUsers: number,
  ): Promise<PerformanceMetric[]> {
    const results: PerformanceMetric[] = []

    for (const query of queries) {
      const result = await this.benchmarkQuery(query.name, query.query, concurrentUsers, query.params || [])
      results.push(result)
    }

    return results
  }

  /**
   * Simulate concurrent users executing the same query
   */
  async simulateConcurrentLoad(
    queryName: string,
    queryText: string,
    concurrentUsers: number,
    params: any[] = [],
  ): Promise<{ averageTimeMs: number; maxTimeMs: number; minTimeMs: number }> {
    const promises: Promise<PerformanceMetric>[] = []

    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(this.benchmarkQuery(queryName, queryText, concurrentUsers, params))
    }

    const results = await Promise.all(promises)

    const executionTimes = results.map((r) => r.executionTimeMs)
    const averageTimeMs = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
    const maxTimeMs = Math.max(...executionTimes)
    const minTimeMs = Math.min(...executionTimes)

    return { averageTimeMs, maxTimeMs, minTimeMs }
  }

  /**
   * Get performance metrics for a specific time period
   */
  async getPerformanceMetrics(startDate: Date, endDate: Date, queryName?: string): Promise<PerformanceMetric[]> {
    const query = this.performanceMetricRepository
      .createQueryBuilder("metric")
      .where("metric.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })

    if (queryName) {
      query.andWhere("metric.queryName = :queryName", { queryName })
    }

    return query.orderBy("metric.createdAt", "DESC").getMany()
  }

  /**
   * Compare performance before and after optimization
   */
  async comparePerformance(
    queryName: string,
    beforeDate: Date,
    afterDate: Date,
  ): Promise<{
    beforeAvgMs: number
    afterAvgMs: number
    improvementPercent: number
  }> {
    const beforeMetrics = await this.performanceMetricRepository.find({
      where: {
        queryName,
        createdAt: { $lt: beforeDate },
      },
    })

    const afterMetrics = await this.performanceMetricRepository.find({
      where: {
        queryName,
        createdAt: { $gt: afterDate },
      },
    })

    const beforeAvgMs =
      beforeMetrics.reduce((sum, metric) => sum + metric.executionTimeMs, 0) / (beforeMetrics.length || 1)

    const afterAvgMs =
      afterMetrics.reduce((sum, metric) => sum + metric.executionTimeMs, 0) / (afterMetrics.length || 1)

    const improvementPercent = beforeAvgMs > 0 ? ((beforeAvgMs - afterAvgMs) / beforeAvgMs) * 100 : 0

    return { beforeAvgMs, afterAvgMs, improvementPercent }
  }
}
