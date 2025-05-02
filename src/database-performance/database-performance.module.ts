import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { BenchmarkService } from "./services/benchmark.service"
import { QueryAnalyzerService } from "./services/query-analyzer.service"
import { CacheService } from "./services/cache.service"
import { ReplicaManagerService } from "./services/replica-manager.service"
import { LoadTestService } from "./services/load-test.service"
import { PerformanceController } from "./controllers/performance.controller"
import { PerformanceMetric } from "./entities/performance-metric.entity"
import { SlowQuery } from "./entities/slow-query.entity"
import { CacheConfig } from "./entities/cache-config.entity"

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([PerformanceMetric, SlowQuery, CacheConfig])],
  controllers: [PerformanceController],
  providers: [BenchmarkService, QueryAnalyzerService, CacheService, ReplicaManagerService, LoadTestService],
  exports: [BenchmarkService, QueryAnalyzerService, CacheService, ReplicaManagerService, LoadTestService],
})
export class DatabasePerformanceModule {}
