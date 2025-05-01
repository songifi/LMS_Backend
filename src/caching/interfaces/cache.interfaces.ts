export enum CacheType {
    MEMORY = "memory",
    REDIS = "redis",
    MEMCACHED = "memcached",
  }
  
  export enum ContentType {
    COURSE = "course",
    LESSON = "lesson",
    USER = "user",
    ASSIGNMENT = "assignment",
    QUIZ = "quiz",
    DISCUSSION = "discussion",
    NOTIFICATION = "notification",
    STATIC = "static",
  }
  
  export interface RedisOptions {
    host: string
    port: number
    password?: string
  }
  
  export interface MemcachedOptions {
    hosts: string[]
  }
  
  export interface CacheModuleOptions {
    useMemory?: boolean
    useRedis?: boolean
    useMemcached?: boolean
    memoryCacheTtl?: number
    memoryCacheMax?: number
    redisCacheTtl?: number
    memcachedCacheTtl?: number
    redisOptions?: RedisOptions
    memcachedOptions?: MemcachedOptions
    contentTypeTtl?: Record<ContentType, number>
    enableMonitoring?: boolean
    monitoringInterval?: number
  }
  
  export interface CacheKey {
    prefix: string
    id: string
    params?: Record<string, any>
  }
  
  export interface CacheStats {
    hits: number
    misses: number
    keys: number
    size: number
    type: CacheType
  }
  
  export interface EntityCacheConfig {
    type: ContentType
    ttl: number
    dependencies?: string[]
    warmupStrategy?: "eager" | "lazy"
    warmupPriority?: number
  }
  