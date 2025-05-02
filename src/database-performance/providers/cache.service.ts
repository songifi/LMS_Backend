import { Injectable, Logger, type OnModuleInit } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { CacheConfig } from "../entities/cache-config.entity"
import * as Redis from "redis"
import { promisify } from "util"

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name)
  private redisClient: Redis.RedisClient
  private getAsync: (key: string) => Promise<string>
  private setAsync: (key: string, value: string, mode: string, duration: number) => Promise<unknown>
  private delAsync: (key: string) => Promise<number>;

  constructor(
    @InjectRepository(CacheConfig)
    private cacheConfigRepository: Repository<CacheConfig>,
  ) { }

  async onModuleInit() {
    await this.connectToRedis()
  }

  private async connectToRedis() {
    this.redisClient = Redis.createClient({
      host: process.env.REDIS_HOST || "localhost",
      port: Number.parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
    })

    this.getAsync = promisify(this.redisClient.get).bind(this.redisClient)
    this.setAsync = promisify(this.redisClient.set).bind(this.redisClient)
    this.delAsync = promisify(this.redisClient.del).bind(this.redisClient)

    this.redisClient.on("error", (error) => {
      this.logger.error(`Redis connection error: ${error.message}`)
    })

    this.redisClient.on("connect", () => {
      this.logger.log("Connected to Redis server")
    })
  }

  /**
   * Cache query results
   */
  async cacheQuery(queryName: string, queryText: string, params: any[], result: any, ttlSeconds = 300): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(queryName, queryText, params)
      await this.setAsync(cacheKey, JSON.stringify(result), "EX", ttlSeconds)

      // Update hit/miss statistics
      await this.updateCacheConfig(queryText, true)

      this.logger.debug(`Cached query result for ${queryName} with TTL ${ttlSeconds}s`)
    } catch (error) {
      this.logger.error(`Error caching query result: ${error.message}`)
    }
  }

  /**
   * Get cached query results
   */
  async getCachedQuery(queryName: string, queryText: string, params: any[]): Promise<any | null> {
    try {
      const cacheKey = this.generateCacheKey(queryName, queryText, params)
      const cachedResult = await this.getAsync(cacheKey)

      if (cachedResult) {
        // Update hit/miss statistics
        await this.updateCacheConfig(queryText, true)
        return JSON.parse(cachedResult)
      }

      // Update hit/miss statistics
      await this.updateCacheConfig(queryText, false)
      return null
    } catch (error) {
      this.logger.error(`Error getting cached query result: ${error.message}`)
      return null
    }
  }

  /**
   * Invalidate cache for a specific query
   */
  async invalidateCache(queryName: string, queryText: string, params: any[]): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(queryName, queryText, params)
      await this.delAsync(cacheKey)
      this.logger.debug(`Invalidated cache for ${queryName}`)
    } catch (error) {
      this.logger.error(`Error invalidating cache: ${error.message}`)
    }
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  async invalidateCachePattern(pattern: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.redisClient.keys(pattern, async (err, keys) => {
        if (err) {
          this.logger.error(`Error getting keys for pattern ${pattern}: ${err.message}`)
          return reject(err)
        }

        if (keys.length > 0) {
          await this.delAsync(keys.join(" "))
          this.logger.debug(`Invalidated ${keys.length} cache entries for pattern ${pattern}`)
        }

        resolve()
      })
    })
  }

  /**
   * Generate a cache key for a query
   */
  private generateCacheKey(queryName: string, queryText: string, params: any[]): string {
    // Create a deterministic cache key based on the query and parameters
    const paramsStr = JSON.stringify(params)
    return `query:${queryName}:${Buffer.from(queryText + paramsStr).toString("base64")}`
  }

  /**
   * Update cache configuration and statistics
   */
  private async updateCacheConfig(queryPattern: string, isHit: boolean): Promise<void> {
    try {
      // Simplify the query pattern by removing specific values
      const simplifiedPattern = queryPattern
        .replace(/\d+/g, "?")
        .replace(/'[^']*'/g, "?")
        .replace(/"[^"]*"/g, "?")

      let cacheConfig = await this.cacheConfigRepository.findOne({
        where: { queryPattern: simplifiedPattern },
      })

      if (!cacheConfig) {
        cacheConfig = new CacheConfig()
        cacheConfig.queryPattern = simplifiedPattern
        cacheConfig.ttlSeconds = 300 // Default TTL
        cacheConfig.hitCount = 0
        cacheConfig.missCount = 0
      }

      if (isHit) {
        cacheConfig.hitCount += 1
      } else {
        cacheConfig.missCount += 1
      }

      await this.cacheConfigRepository.save(cacheConfig)
    } catch (error) {
      this.logger.error(`Error updating cache config: ${error.message}`)
    }
  }

  /**
   * Get cache hit rate statistics
   */
  async getCacheStats(): Promise<{
    totalHits: number
    totalMisses: number
    hitRate: number
    cacheConfigs: CacheConfig[]
  }> {
    const cacheConfigs = await this.cacheConfigRepository.find()

    const totalHits = cacheConfigs.reduce((sum, config) => sum + config.hitCount, 0)
    const totalMisses = cacheConfigs.reduce((sum, config) => sum + config.missCount, 0)
    const hitRate = totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0

    return {
      totalHits,
      totalMisses,
      hitRate,
      cacheConfigs,
    }
  }

  /**
   * Update TTL for a cache configuration
   */
  async updateCacheTTL(id: string, ttlSeconds: number): Promise<CacheConfig> {
    const cacheConfig = await this.cacheConfigRepository.findOne(id)

    if (!cacheConfig) {
      throw new Error(`Cache configuration with ID ${id} not found`)
    }

    cacheConfig.ttlSeconds = ttlSeconds
    return this.cacheConfigRepository.save(cacheConfig)
  }

  /**
   * Enable or disable caching for a specific query pattern
   */
  async toggleCaching(id: string, isEnabled: boolean): Promise<CacheConfig> {
    const cacheConfig = await this.cacheConfigRepository.findOne(id)

    if (!cacheConfig) {
      throw new Error(`Cache configuration with ID ${id} not found`)
    }

    cacheConfig.isEnabled = isEnabled
    return this.cacheConfigRepository.save(cacheConfig)
  }
}
