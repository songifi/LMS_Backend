import { Controller, Get, Post, Body, Param, Query, Logger } from "@nestjs/common"
import type { BenchmarkService } from "../services/benchmark.service"
import type { QueryAnalyzerService } from "../services/query-analyzer.service"
import type { CacheService } from "../services/cache.service"
import type { ReplicaManagerService } from "../services/replica-manager.service"
import type { LoadTestService } from "../services/load-test.service"

@Controller("database-performance")
export class PerformanceController {
  private readonly logger = new Logger(PerformanceController.name)

  constructor(
    private benchmarkService: BenchmarkService,
    private queryAnalyzerService: QueryAnalyzerService,
    private cacheService: CacheService,
    private replicaManagerService: ReplicaManagerService,
    private loadTestService: LoadTestService,
  ) {}

  @Get("health")
  async checkHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      replicas: await this.replicaManagerService.checkReplicaHealth(),
    }
  }

  @Post('benchmark')
  async benchmarkQuery(
    @Body() body: {
      queryName: string;
      queryText: string;
      concurrentUsers: number;
      params?: any[];
    },
  ) {
    this.logger.log(`Benchmarking query: ${body.queryName}`);
    return this.benchmarkService.benchmarkQuery(
      body.queryName,
      body.queryText,
      body.concurrentUsers,
      body.params,
    );
  }

  @Post('benchmark/suite')
  async benchmarkSuite(
    @Body() body: { 
      queries: Array<{ name: string; query: string; params?: any[] }>;
      concurrentUsers: number;
    },
  ) {
    this.logger.log(`Running benchmark suite with ${body.queries.length} queries`);
    return this.benchmarkService.runBenchmarkSuite(
      body.queries,
      body.concurrentUsers,
    );
  }

  @Post('analyze')
  async analyzeQuery(
    @Body() body: { 
      queryText: string; 
      params?: any[];
    },
  ) {
    this.logger.log(`Analyzing query: ${body.queryText.substring(0, 50)}...`);
    return this.queryAnalyzerService.analyzeQuery(
      body.queryText,
      body.params,
    );
  }

  @Get("slow-queries")
  async getSlowQueries(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('tableName') tableName?: string,
  ) {
    return this.queryAnalyzerService.getSlowQueries(new Date(startDate), new Date(endDate), tableName)
  }

  @Get("generate-migrations")
  async generateMigrations() {
    return {
      migrationScript: await this.queryAnalyzerService.generateIndexMigrations(),
    }
  }

  @Get("cache/stats")
  async getCacheStats() {
    return this.cacheService.getCacheStats()
  }

  @Post('cache/update-ttl')
  async updateCacheTTL(
    @Body() body: { 
      id: string; 
      ttlSeconds: number;
    },
  ) {
    return this.cacheService.updateCacheTTL(
      body.id,
      body.ttlSeconds,
    );
  }

  @Post('cache/toggle')
  async toggleCaching(
    @Body() body: { 
      id: string; 
      isEnabled: boolean;
    },
  ) {
    return this.cacheService.toggleCaching(
      body.id,
      body.isEnabled,
    );
  }

  @Post('cache/invalidate')
  async invalidateCache(
    @Body() body: { 
      pattern: string;
    },
  ) {
    await this.cacheService.invalidateCachePattern(body.pattern);
    return { success: true };
  }

  @Get("replica/config")
  async getReplicaConfig() {
    return this.replicaManagerService.getReplicaConfiguration()
  }

  @Get("replica/lag")
  async getReplicaLag() {
    return this.replicaManagerService.getReplicaLag()
  }

  @Post('load-test')
  async runLoadTest(
    @Body() body: { 
      testName: string;
      query: string;
      params?: any[];
      startConcurrency?: number;
      maxConcurrency?: number;
      step?: number;
      queriesPerConcurrencyLevel?: number;
    },
  ) {
    this.logger.log(`Starting load test: ${body.testName}`);
    return this.loadTestService.runLoadTest(
      body.testName,
      body.query,
      body.params,
      body.startConcurrency,
      body.maxConcurrency,
      body.step,
      body.queriesPerConcurrencyLevel,
    );
  }

  @Get('load-test/report/:testName')
  async getLoadTestReport(
    @Param('testName') testName: string,
  ) {
    return {
      report: await this.loadTestService.generateLoadTestReport(testName),
    };
  }

  @Get("load-test/compare")
  async compareLoadTests(@Query('beforeTest') beforeTest: string, @Query('afterTest') afterTest: string) {
    return this.loadTestService.compareLoadTestResults(beforeTest, afterTest)
  }
}
