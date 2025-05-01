import { Module, type DynamicModule } from "@nestjs/common"
import { CacheModule } from "@nestjs/cache-manager"
import { ScheduleModule } from "@nestjs/schedule"
import { CacheConfigService } from "./services/cache-config.service"
import { CacheService } from "./services/cache.service"
import { CacheWarmerService } from "./services/cache-warmer.service"
import { CacheMonitoringService } from "./services/cache-monitoring.service"
import { CacheInvalidationService } from "./services/cache-invalidation.service"
import { redisStore } from "cache-manager-redis-store"
import { memcachedStore } from "cache-manager-memcached-store"
import type { CacheModuleOptions } from "./interfaces/cache.interfaces"

@Module({})
export class AppCacheModule {
  static register(options: CacheModuleOptions): DynamicModule {
    return {
      module: AppCacheModule,
      imports: [
        CacheModule.registerAsync({
          useFactory: async () => {
            const cacheStores = []

            // Add memory cache as the first level
            if (options.useMemory) {
              cacheStores.push({
                ttl: options.memoryCacheTtl || 60 * 1000, // 1 minute default
                max: options.memoryCacheMax || 1000, // Maximum 1000 items
              })
            }

            // Add Redis as the second level
            if (options.useRedis) {
              cacheStores.push({
                store: await redisStore({
                  socket: {
                    host: options.redisOptions?.host || "localhost",
                    port: options.redisOptions?.port || 6379,
                  },
                  ttl: options.redisCacheTtl || 30 * 60 * 1000, // 30 minutes default
                }),
              })
            }

            // Add Memcached as the third level
            if (options.useMemcached) {
              cacheStores.push({
                store: memcachedStore,
                options: {
                  hosts: options.memcachedOptions?.hosts || ["localhost:11211"],
                  ttl: options.memcachedCacheTtl || 60 * 60 * 1000, // 1 hour default
                },
              })
            }

            return {
              isGlobal: true,
              stores: cacheStores,
            }
          },
        }),
        ScheduleModule.forRoot(),
      ],
      providers: [
        CacheConfigService,
        CacheService,
        CacheWarmerService,
        CacheMonitoringService,
        CacheInvalidationService,
        {
          provide: "CACHE_OPTIONS",
          useValue: options,
        },
      ],
      exports: [CacheService, CacheWarmerService, CacheMonitoringService, CacheInvalidationService],
    }
  }
}
