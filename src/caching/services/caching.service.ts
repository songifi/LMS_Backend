import { Injectable, Inject } from "@nestjs/common"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import type { Cache } from "cache-manager"
import type { CacheMonitoringService } from "./cache-monitoring.service"
import type { CacheConfigService } from "./cache-config.service"
import type { CacheKey, ContentType } from "../interfaces/cache.interfaces"

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly monitoringService: CacheMonitoringService,
    private readonly configService: CacheConfigService,
  ) {}

  /**
   * Builds a standardized cache key
   */
  buildKey(key: CacheKey): string {
    const { prefix, id, params } = key
    let cacheKey = `${prefix}:${id}`

    if (params) {
      const sortedParams = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&")

      if (sortedParams) {
        cacheKey += `:${sortedParams}`
      }
    }

    return cacheKey
  }

  /**
   * Get a value from cache with monitoring
   */
  async get<T>(key: CacheKey): Promise<T | undefined> {
    const cacheKey = this.buildKey(key)
    const startTime = Date.now()
    const value = await this.cacheManager.get<T>(cacheKey)
    const endTime = Date.now()

    if (value === undefined) {
      this.monitoringService.recordMiss(key.prefix, endTime - startTime)
      return undefined
    }

    this.monitoringService.recordHit(key.prefix, endTime - startTime)
    return value
  }

  /**
   * Set a value in cache with appropriate TTL based on content type
   */
  async set(key: CacheKey, value: any, contentType: ContentType): Promise<void> {
    const cacheKey = this.buildKey(key)
    const ttl = this.configService.getTtlForContentType(contentType)

    await this.cacheManager.set(cacheKey, value, ttl)
    this.monitoringService.recordSet(key.prefix, JSON.stringify(value).length)
  }

  /**
   * Delete a specific key from cache
   */
  async delete(key: CacheKey): Promise<void> {
    const cacheKey = this.buildKey(key)
    await this.cacheManager.del(cacheKey)
    this.monitoringService.recordDelete(key.prefix)
  }

  /**
   * Clear all keys with a specific prefix
   */
  async clearByPrefix(prefix: string): Promise<void> {
    // This implementation depends on the cache store being used
    // For Redis, we can use the SCAN command to find keys by pattern
    // For memory cache, we need to iterate through all keys
    // This is a simplified version
    const store = this.cacheManager.store

    if ("keys" in store) {
      const keys = await store.keys()
      const keysToDelete = keys.filter((k) => k.startsWith(prefix))

      for (const key of keysToDelete) {
        await this.cacheManager.del(key)
      }

      this.monitoringService.recordBulkDelete(prefix, keysToDelete.length)
    }
  }

  /**
   * Check if a key exists in cache
   */
  async has(key: CacheKey): Promise<boolean> {
    const cacheKey = this.buildKey(key)
    const value = await this.cacheManager.get(cacheKey)
    return value !== undefined
  }

  /**
   * Get multiple values at once
   */
  async getMany<T>(keys: CacheKey[]): Promise<(T | undefined)[]> {
    const cacheKeys = keys.map((key) => this.buildKey(key))
    const results = await Promise.all(cacheKeys.map((key) => this.cacheManager.get<T>(key)))

    // Record hits and misses
    results.forEach((result, index) => {
      if (result === undefined) {
        this.monitoringService.recordMiss(keys[index].prefix, 0)
      } else {
        this.monitoringService.recordHit(keys[index].prefix, 0)
      }
    })

    return results
  }

  /**
   * Set multiple values at once
   */
  async setMany(items: { key: CacheKey; value: any; contentType: ContentType }[]): Promise<void> {
    await Promise.all(items.map((item) => this.set(item.key, item.value, item.contentType)))
  }
}
