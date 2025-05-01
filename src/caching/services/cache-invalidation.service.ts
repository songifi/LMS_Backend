import { Injectable } from "@nestjs/common"
import type { CacheService } from "./cache.service"
import type { CacheConfigService } from "./cache-config.service"
import type { CacheKey } from "../interfaces/cache.interfaces"

@Injectable()
export class CacheInvalidationService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: CacheConfigService,
  ) {}

  /**
   * Invalidate a specific entity by key
   */
  async invalidateEntity(key: CacheKey): Promise<void> {
    await this.cacheService.delete(key)
  }

  /**
   * Invalidate all entities of a specific type
   */
  async invalidateByPrefix(prefix: string): Promise<void> {
    await this.cacheService.clearByPrefix(prefix)
  }

  /**
   * Invalidate an entity and all its dependencies
   */
  async invalidateEntityWithDependencies(entityName: string, entityId: string): Promise<void> {
    // Invalidate the entity itself
    await this.cacheService.delete({
      prefix: entityName,
      id: entityId,
    })

    // Get dependencies and invalidate them
    const dependencies = this.configService.getEntityDependencies(entityName)

    for (const dependency of dependencies) {
      await this.cacheService.clearByPrefix(`${dependency}:${entityId}`)
    }
  }

  /**
   * Invalidate cache based on a mutation event
   */
  async invalidateOnMutation(
    entityName: string,
    entityId: string,
    operation: "create" | "update" | "delete",
  ): Promise<void> {
    // Invalidate the specific entity
    await this.invalidateEntityWithDependencies(entityName, entityId)

    // For certain operations, we might want to invalidate collections
    if (operation === "create" || operation === "delete") {
      await this.cacheService.clearByPrefix(`${entityName}:list`)
    }
  }

  /**
   * Set up a TTL-based invalidation strategy
   */
  setupTtlInvalidation(): void {
    // This is handled automatically by the cache stores based on TTL
    // No additional setup needed
  }

  /**
   * Invalidate cache based on a pattern
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    // This implementation depends on the cache store being used
    // For Redis, we can use the SCAN command to find keys by pattern
    // For memory cache, we need to iterate through all keys
    // This is a simplified version that delegates to clearByPrefix
    await this.cacheService.clearByPrefix(pattern)
  }
}
