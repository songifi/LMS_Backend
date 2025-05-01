import { Injectable, type OnModuleInit } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { CacheService } from "./cache.service"
import type { CacheConfigService } from "./cache-config.service"
import type { ContentType } from "../interfaces/cache.interfaces"

@Injectable()
export class CacheWarmerService implements OnModuleInit {
  private readonly warmupHandlers: Map<string, () => Promise<void>> = new Map()

  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: CacheConfigService,
  ) {}

  async onModuleInit() {
    // Perform initial cache warming on startup
    await this.warmCacheByPriority(1) // Highest priority first
  }

  /**
   * Register a warmup handler for a specific entity
   */
  registerWarmupHandler(entityName: string, handler: () => Promise<void>): void {
    this.warmupHandlers.set(entityName, handler)
  }

  /**
   * Warm cache for entities with a specific priority
   */
  async warmCacheByPriority(priority: number): Promise<void> {
    const entities = this.configService.getWarmupEntities(priority)

    for (const entity of entities) {
      const handler = this.warmupHandlers.get(entity)

      if (handler) {
        await handler()
      }
    }
  }

  /**
   * Warm cache for a specific entity
   */
  async warmEntityCache(
    entityName: string,
    getData: () => Promise<any>,
    id: string,
    contentType: ContentType,
  ): Promise<void> {
    const data = await getData()

    await this.cacheService.set({ prefix: entityName, id }, data, contentType)
  }

  /**
   * Warm cache for a collection of entities
   */
  async warmCollectionCache(
    entityName: string,
    getData: () => Promise<any[]>,
    params: Record<string, any>,
    contentType: ContentType,
  ): Promise<void> {
    const data = await getData()

    await this.cacheService.set({ prefix: `${entityName}:list`, id: "all", params }, data, contentType)
  }

  /**
   * Run cache warming for high-priority items every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyWarmup() {
    await this.warmCacheByPriority(1)
  }

  /**
   * Run cache warming for medium-priority items every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleSixHourlyWarmup() {
    await this.warmCacheByPriority(2)
  }

  /**
   * Run cache warming for low-priority items every day
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyWarmup() {
    await this.warmCacheByPriority(3)
  }

  /**
   * Warm cache before predictable high-traffic events
   */
  async warmBeforeHighTrafficEvent(eventName: string): Promise<void> {
    // Warm all caches regardless of priority
    const allPriorities = [1, 2, 3]

    for (const priority of allPriorities) {
      await this.warmCacheByPriority(priority)
    }

    // Log the event
    console.log(`Cache warmed for high-traffic event: ${eventName}`)
  }
}
