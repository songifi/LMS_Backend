import { Injectable, Logger } from "@nestjs/common"
import type { Connection } from "typeorm"
import * as fs from "fs"
import * as path from "path"
import type { BenchmarkService } from "./benchmark.service"

interface LoadTestResult {
  testName: string
  concurrentUsers: number
  totalQueries: number
  averageResponseTimeMs: number
  maxResponseTimeMs: number
  minResponseTimeMs: number
  queriesPerSecond: number
  successRate: number
  duration: number
  timestamp: Date
}

@Injectable()
export class LoadTestService {
  private readonly logger = new Logger(LoadTestService.name)

  constructor(
    private connection: Connection,
    private benchmarkService: BenchmarkService,
  ) {}

  /**
   * Run a load test with increasing concurrency
   */
  async runLoadTest(
    testName: string,
    query: string,
    params: any[] = [],
    startConcurrency = 1,
    maxConcurrency = 100,
    step = 10,
    queriesPerConcurrencyLevel = 100,
  ): Promise<LoadTestResult[]> {
    const results: LoadTestResult[] = []

    for (let concurrentUsers = startConcurrency; concurrentUsers <= maxConcurrency; concurrentUsers += step) {
      this.logger.log(`Running load test with ${concurrentUsers} concurrent users`)

      const startTime = Date.now()
      let successCount = 0
      const responseTimes: number[] = []

      const promises: Promise<void>[] = []

      for (let i = 0; i < queriesPerConcurrencyLevel; i++) {
        promises.push(
          this.executeQueryWithTimeout(query, params, 30000) // 30 second timeout
            .then((executionTimeMs) => {
              successCount++
              responseTimes.push(executionTimeMs)
            })
            .catch((error) => {
              this.logger.error(`Query execution failed: ${error.message}`)
            }),
        )
      }

      await Promise.all(promises)

      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000 // in seconds

      const averageResponseTimeMs =
        responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0

      const maxResponseTimeMs = responseTimes.length > 0 ? Math.max(...responseTimes) : 0

      const minResponseTimeMs = responseTimes.length > 0 ? Math.min(...responseTimes) : 0

      const queriesPerSecond = duration > 0 ? successCount / duration : 0

      const successRate = queriesPerConcurrencyLevel > 0 ? (successCount / queriesPerConcurrencyLevel) * 100 : 0

      const result: LoadTestResult = {
        testName,
        concurrentUsers,
        totalQueries: queriesPerConcurrencyLevel,
        averageResponseTimeMs,
        maxResponseTimeMs,
        minResponseTimeMs,
        queriesPerSecond,
        successRate,
        duration,
        timestamp: new Date(),
      }

      results.push(result)

      this.logger.log(
        `Concurrency: ${concurrentUsers}, ` +
          `Avg Response: ${averageResponseTimeMs.toFixed(2)}ms, ` +
          `QPS: ${queriesPerSecond.toFixed(2)}, ` +
          `Success Rate: ${successRate.toFixed(2)}%`,
      )

      // If success rate drops below 90%, stop the test
      if (successRate < 90) {
        this.logger.warn(`Success rate dropped below 90% at ${concurrentUsers} concurrent users. Stopping test.`)
        break
      }
    }

    // Save results to file
    await this.saveLoadTestResults(testName, results)

    return results
  }

  /**
   * Execute a query with a timeout
   */
  private async executeQueryWithTimeout(query: string, params: any[] = [], timeoutMs: number): Promise<number> {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Query execution timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      try {
        const startTime = Date.now()
        const queryRunner = this.connection.createQueryRunner()
        await queryRunner.connect()

        try {
          await queryRunner.query(query, params)
          const executionTimeMs = Date.now() - startTime
          clearTimeout(timeoutId)
          resolve(executionTimeMs)
        } finally {
          await queryRunner.release()
        }
      } catch (error) {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }

  /**
   * Save load test results to a file
   */
  private async saveLoadTestResults(testName: string, results: LoadTestResult[]): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, "-")
      const fileName = `load-test-${testName}-${timestamp}.json`
      const filePath = path.join(process.cwd(), "load-test-results", fileName)

      // Ensure directory exists
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(filePath, JSON.stringify(results, null, 2))
      this.logger.log(`Load test results saved to ${filePath}`)
    } catch (error) {
      this.logger.error(`Error saving load test results: ${error.message}`)
    }
  }

  /**
   * Compare load test results before and after optimization
   */
  async compareLoadTestResults(
    beforeTestName: string,
    afterTestName: string,
  ): Promise<{
    concurrentUsers: number[]
    beforeAvgResponseTime: number[]
    afterAvgResponseTime: number[]
    beforeQPS: number[]
    afterQPS: number[]
    improvementPercent: number[]
  }> {
    try {
      const beforeResults = await this.loadTestResultsFromFile(beforeTestName)
      const afterResults = await this.loadTestResultsFromFile(afterTestName)

      if (!beforeResults || !afterResults) {
        throw new Error("Could not find load test results")
      }

      // Find common concurrency levels
      const concurrencyLevels = beforeResults
        .map((r) => r.concurrentUsers)
        .filter((c) => afterResults.some((r) => r.concurrentUsers === c))

      const result = {
        concurrentUsers: concurrencyLevels,
        beforeAvgResponseTime: [] as number[],
        afterAvgResponseTime: [] as number[],
        beforeQPS: [] as number[],
        afterQPS: [] as number[],
        improvementPercent: [] as number[],
      }

      for (const concurrency of concurrencyLevels) {
        const beforeResult = beforeResults.find((r) => r.concurrentUsers === concurrency)
        const afterResult = afterResults.find((r) => r.concurrentUsers === concurrency)

        if (beforeResult && afterResult) {
          result.beforeAvgResponseTime.push(beforeResult.averageResponseTimeMs)
          result.afterAvgResponseTime.push(afterResult.averageResponseTimeMs)
          result.beforeQPS.push(beforeResult.queriesPerSecond)
          result.afterQPS.push(afterResult.queriesPerSecond)

          const responseTimeImprovement =
            beforeResult.averageResponseTimeMs > 0
              ? ((beforeResult.averageResponseTimeMs - afterResult.averageResponseTimeMs) /
                  beforeResult.averageResponseTimeMs) *
                100
              : 0

          result.improvementPercent.push(responseTimeImprovement)
        }
      }

      return result
    } catch (error) {
      this.logger.error(`Error comparing load test results: ${error.message}`)
      throw error
    }
  }

  /**
   * Load test results from a file
   */
  private async loadTestResultsFromFile(testName: string): Promise<LoadTestResult[] | null> {
    try {
      const dir = path.join(process.cwd(), "load-test-results")

      if (!fs.existsSync(dir)) {
        return null
      }

      const files = fs.readdirSync(dir)
      const matchingFile = files.find((file) => file.includes(`load-test-${testName}`))

      if (!matchingFile) {
        return null
      }

      const filePath = path.join(dir, matchingFile)
      const fileContent = fs.readFileSync(filePath, "utf8")

      return JSON.parse(fileContent) as LoadTestResult[]
    } catch (error) {
      this.logger.error(`Error loading test results: ${error.message}`)
      return null
    }
  }

  /**
   * Generate a load test report
   */
  async generateLoadTestReport(testName: string): Promise<string> {
    try {
      const results = await this.loadTestResultsFromFile(testName)

      if (!results) {
        return `No results found for test "${testName}"`
      }

      let report = `# Load Test Report: ${testName}\n\n`
      report += `Test conducted on: ${results[0].timestamp}\n\n`

      report += `## Summary\n\n`
      report += `- Maximum concurrency tested: ${Math.max(...results.map((r) => r.concurrentUsers))}\n`
      report += `- Maximum QPS achieved: ${Math.max(...results.map((r) => r.queriesPerSecond)).toFixed(2)}\n`
      report += `- Minimum average response time: ${Math.min(...results.map((r) => r.averageResponseTimeMs)).toFixed(2)}ms\n\n`

      report += `## Detailed Results\n\n`
      report += `| Concurrent Users | Avg Response Time (ms) | Max Response Time (ms) | QPS | Success Rate (%) |\n`
      report += `|-----------------|------------------------|------------------------|-----|------------------|\n`

      for (const result of results) {
        report += `| ${result.concurrentUsers} | ${result.averageResponseTimeMs.toFixed(2)} | ${result.maxResponseTimeMs.toFixed(2)} | ${result.queriesPerSecond.toFixed(2)} | ${result.successRate.toFixed(2)} |\n`
      }

      return report
    } catch (error) {
      this.logger.error(`Error generating load test report: ${error.message}`)
      return `Error generating report: ${error.message}`
    }
  }
}
