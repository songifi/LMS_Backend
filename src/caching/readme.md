# NestJS Multi-Level Caching Module

This module provides a comprehensive caching strategy for NestJS applications, specifically optimized for Learning Management Systems (LMS).

## Features

- **Cache Abstraction Layer**: Unified API for different cache providers
- **Multi-level Caching**: Support for memory, Redis, and Memcached
- **Entity-based Cache Invalidation**: Intelligent invalidation based on entity relationships
- **Cache Warming**: Proactive cache population for predictable high-traffic events
- **Cache Monitoring**: Track hit/miss rates and cache performance
- **TTL Policies**: Content-type specific TTL settings
- **Memory Optimization**: Configurable memory limits and eviction policies

## Installation

\`\`\`bash
npm install cache-manager cache-manager-redis-store cache-manager-memcached-store @nestjs/cache-manager @nestjs/schedule
\`\`\`

## Usage

### Module Registration

Register the cache module in your application:

\`\`\`typescript
import { Module } from '@nestjs/common';
import { AppCacheModule } from './cache/cache.module';
import { ContentType } from './cache/interfaces/cache.interfaces';

@Module({
  imports: [
    AppCacheModule.register({
      useMemory: true,
      useRedis: true,
      useMemcached: false,
      memoryCacheTtl: 60 * 1000, // 1 minute
      redisCacheTtl: 30 * 60 * 1000, // 30 minutes
      redisOptions: {
        host: 'localhost',
        port: 6379,
      },
      contentTypeTtl: {
        [ContentType.COURSE]: 60 * 60 * 1000, // 1 hour
        [ContentType.LESSON]: 30 * 60 * 1000, // 30 minutes
      },
      enableMonitoring: true,
    }),
  ],
})
export class AppModule {}
\`\`\`

### Using the Cache Service

Inject and use the cache service in your providers:

\`\`\`typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from './cache/services/cache.service';
import { ContentType } from './cache/interfaces/cache.interfaces';

@Injectable()
export class CourseService {
  constructor(private readonly cacheService: CacheService) {}

  async getCourse(id: string) {
    // Try to get from cache first
    const cachedCourse = await this.cacheService.get({
      prefix: 'course',
      id,
    });

    if (cachedCourse) {
      return cachedCourse;
    }

    // If not in cache, fetch from database
    const course = await this.fetchCourseFromDatabase(id);

    // Store in cache
    await this.cacheService.set(
      { prefix: 'course', id },
      course,
      ContentType.COURSE
    );

    return course;
  }

  private async fetchCourseFromDatabase(id: string) {
    // Database fetch logic here
    return { id, title: 'Sample Course' };
  }
}
\`\`\`

### Using the Cache Decorator

For simpler use cases, you can use the `@Cached` decorator:

\`\`\`typescript
import { Injectable } from '@nestjs/common';
import { Cached } from './cache/decorators/cached.decorator';
import { ContentType } from './cache/interfaces/cache.interfaces';

@Injectable()
export class LessonService {
  constructor(private readonly cacheService: CacheService) {}

  @Cached({
    prefix: 'lesson',
    contentType: ContentType.LESSON,
    idFromArgs: (args) => args[0], // First argument is the ID
  })
  async getLesson(id: string) {
    // This method will be cached automatically
    return this.fetchLessonFromDatabase(id);
  }

  private async fetchLessonFromDatabase(id: string) {
    // Database fetch logic here
    return { id, title: 'Sample Lesson' };
  }
}
\`\`\`

### Cache Invalidation

Invalidate cache when data changes:

\`\`\`typescript
import { Injectable } from '@nestjs/common';
import { CacheInvalidationService } from './cache/services/cache-invalidation.service';

@Injectable()
export class CourseUpdateService {
  constructor(private readonly cacheInvalidationService: CacheInvalidationService) {}

  async updateCourse(id: string, data: any) {
    // Update in database
    await this.updateCourseInDatabase(id, data);

    // Invalidate cache
    await this.cacheInvalidationService.invalidateEntityWithDependencies('course', id);
  }

  private async updateCourseInDatabase(id: string, data: any) {
    // Database update logic here
  }
}
\`\`\`

### Cache Warming

Set up cache warming for high-traffic events:

\`\`\`typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CacheWarmerService } from './cache/services/cache-warmer.service';
import { ContentType } from './cache/interfaces/cache.interfaces';

@Injectable()
export class CourseWarmerService implements OnModuleInit {
  constructor(
    private readonly cacheWarmerService: CacheWarmerService,
    private readonly courseService: CourseService,
  ) {}

  onModuleInit() {
    // Register warmup handler
    this.cacheWarmerService.registerWarmupHandler('popularCourses', async () => {
      await this.warmPopularCourses();
    });
  }

  async warmPopularCourses() {
    const popularCourseIds = await this.getPopularCourseIds();

    for (const id of popularCourseIds) {
      await this.cacheWarmerService.warmEntityCache(
        'course',
        () => this.courseService.fetchCourseFromDatabase(id),
        id,
        ContentType.COURSE
      );
    }
  }

  private async getPopularCourseIds(): Promise<string[]> {
    // Logic to determine popular courses
    return ['course1', 'course2', 'course3'];
  }
}
\`\`\`

## Cache Monitoring

The module includes built-in monitoring capabilities. You can access cache statistics through the `CacheMonitoringService`:

\`\`\`typescript
import { Injectable } from '@nestjs/common';
import { CacheMonitoringService } from './cache/services/cache-monitoring.service';

@Injectable()
export class AdminService {
  constructor(private readonly monitoringService: CacheMonitoringService) {}

  getCacheStats() {
    return {
      stats: this.monitoringService.getStats(),
      uptime: this.monitoringService.getUptime(),
      hitRate: this.monitoringService.getOverallHitRate(),
    };
  }
}
\`\`\`

## Best Practices

1. **Choose appropriate TTLs**: Different content types should have different TTLs based on how frequently they change.
2. **Use entity-based invalidation**: When an entity changes, invalidate all related entities.
3. **Monitor cache performance**: Regularly check hit rates and adjust your caching strategy accordingly.
4. **Warm cache proactively**: For predictable high-traffic events, warm the cache in advance.
5. **Use memory cache for frequently accessed data**: Keep hot data in memory for fastest access.
6. **Use distributed cache for shared data**: Use Redis or Memcached for data that needs to be shared across instances.
