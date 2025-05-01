import { Injectable, Inject } from "@nestjs/common"
import { ContentType, type CacheModuleOptions, type EntityCacheConfig } from "../interfaces/cache.interfaces"

@Injectable()
export class CacheConfigService {
  private readonly contentTypeTtlMap: Map<ContentType, number>
  private readonly entityConfigMap: Map<string, EntityCacheConfig>;

  constructor(@Inject('CACHE_OPTIONS') private options: CacheModuleOptions) {
    // Initialize default TTLs for different content types
    this.contentTypeTtlMap = new Map<ContentType, number>([
      [ContentType.COURSE, 60 * 60 * 1000],], // 1 hour
      [ContentType.LESSON, 30 * 60 * 1000], // 30 minutes
      [ContentType.USER, 15 * 60 * 1000], // 15 minutes
      [ContentType.ASSIGNMENT, 10 * 60 * 1000], // 10 minutes
      [ContentType.QUIZ, 5 * 60 * 1000], // 5 minutes
      [ContentType.DISCUSSION, 2 * 60 * 1000], // 2 minutes
      [ContentType.NOTIFICATION, 1 * 60 * 1000], // 1 minute
      [ContentType.STATIC, 24 * 60 * 60 * 1000], // 24 hours
    ]);

    // Override with user-provided TTLs if any
    if (options.contentTypeTtl) {
      Object.entries(options.contentTypeTtl).forEach(([type, ttl]) => {
        this.contentTypeTtlMap.set(type as ContentType, ttl);
      });
    }

    // Initialize entity config map
    this.entityConfigMap = new Map<string, EntityCacheConfig>();
  }

  /**
   * Get TTL for a specific content type
   */
  getTtlForContentType(contentType: ContentType): number {
    return this.contentTypeTtlMap.get(contentType) || 60 * 1000 // Default to 1 minute
  }

  /**
   * Register entity cache configuration
   */
  registerEntityConfig(entityName: string, config: EntityCacheConfig): void {
    this.entityConfigMap.set(entityName, config)
  }

  /**
   * Get entity cache configuration
   */
  getEntityConfig(entityName: string): EntityCacheConfig | undefined {
    return this.entityConfigMap.get(entityName)
  }

  /**
   * Get all entity dependencies
   */
  getEntityDependencies(entityName: string): string[] {
    const config = this.entityConfigMap.get(entityName)
    return config?.dependencies || []
  }

  /**
   * Get entities for warmup by priority
   */
  getWarmupEntities(priority?: number): string[] {
    const entities: string[] = []

    this.entityConfigMap.forEach((config, entityName) => {
      if (config.warmupStrategy === "eager") {
        if (priority === undefined || config.warmupPriority === priority) {
          entities.push(entityName)
        }
      }
    })

    return entities
  }

  /**
   * Check if monitoring is enabled
   */
  isMonitoringEnabled(): boolean {
    return this.options.enableMonitoring !== false
  }

  /**
   * Get monitoring interval
   */
  getMonitoringInterval(): number {
    return this.options.monitoringInterval || 60 * 1000 // Default to 1 minute
  }
}
