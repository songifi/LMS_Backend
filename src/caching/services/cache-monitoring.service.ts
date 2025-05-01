import { Injectable, type OnModuleInit } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { CacheConfigService } from "./cache-config.service"

@Injectable()
export class CacheMonitoringService implements OnModuleInit {
  private stats: Map<string, { hits: number; misses: number; sets: number; deletes: number; size: number }> = new Map()
  private readonly startTime: number

  constructor(private readonly configService: CacheConfigService) {
    this.startTime = Date.now()
  }

  onModuleInit() {
    // Initialize monitoring if enabled
    if (this.configService.isMonitoringEnabled()) {
      console.log("Cache monitoring enabled")
    }
  }

  /**
   * Record a cache hit
   */
  recordHit(prefix: string, duration: number): void {
    if (!this.configService.isMonitoringEnabled()) return

    const stats = this.getOrCreateStats(prefix)
    stats.hits += 1
  }

  /**
   * Record a cache miss
   */
  recordMiss(prefix: string, duration: number): void {
    if (!this.configService.isMonitoringEnabled()) return

    const stats = this.getOrCreateStats(prefix)
    stats.misses += 1
  }

  /**
   * Record a cache set operation
   */
  recordSet(prefix: string, size: number): void {
    if (!this.configService.isMonitoringEnabled()) return

    const stats = this.getOrCreateStats(prefix)
    stats.sets += 1
    stats.size += size
  }

  /**
   * Record a cache delete operation
   */
  recordDelete(prefix: string): void {
    if (!this.configService.isMonitoringEnabled()) return

    const stats = this.getOrCreateStats(prefix)
    stats.deletes += 1
  }

  /**
   * Record a bulk delete operation
   */
  recordBulkDelete(prefix: string, count: number): void {
    if (!this.configService.isMonitoringEnabled()) return

    const stats = this.getOrCreateStats(prefix)
    stats.deletes += count
  }

  /**
   * Get or create stats for a prefix
   */
  private getOrCreateStats(prefix: string) {
    if (!this.stats.has(prefix)) {
      this.stats.set(prefix, {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        size: 0,
      })
    }

    return this.stats.get(prefix)!
  }

  /**
   * Get cache stats for all prefixes
   */
  getStats(): Record<string, { hits: number; misses: number; hitRate: number; size: number }> {
    const result: Record<string, any> = {}

    this.stats.forEach((stats, prefix) => {
      const total = stats.hits + stats.misses
      const hitRate = total > 0 ? stats.hits / total : 0

      result[prefix] = {
        hits: stats.hits,
        misses: stats.misses,
        sets: stats.sets,
        deletes: stats.deletes,
        hitRate: hitRate,
        size: stats.size,
      }
    })

    return result
  }

  /**
   * Get cache stats for a specific prefix
   */
  getStatsForPrefix(prefix: string): { hits: number; misses: number; hitRate: number; size: number } | undefined {
    const stats = this.stats.get(prefix)

    if (!stats) {
      return undefined
    }

    const total = stats.hits + stats.misses
    const hitRate = total > 0 ? stats.hits / total : 0

    return {
      hits: stats.hits,
      misses: stats.misses,
      hitRate: hitRate,
      size: stats.size,
    }
  }

  /**
   * Reset stats
   */
  resetStats(): void {
    this.stats.clear()
  }

  /**
   * Log stats periodically
   */
  @Cron(CronExpression.EVERY_MINUTE)
  logStats(): void {
    if (!this.configService.isMonitoringEnabled()) return

    const stats = this.getStats()
    console.log("Cache Stats:", JSON.stringify(stats, null, 2))
  }

  /**
   * Get uptime in seconds
   */
  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000)
  }

  /**
   * Get overall hit rate
   */
  getOverallHitRate(): number {
    let totalHits = 0
    let totalMisses = 0

    this.stats.forEach((stats) => {
      totalHits += stats.hits
      totalMisses += stats.misses
    })

    const total = totalHits + totalMisses
    return total > 0 ? totalHits / total : 0
  }
}
