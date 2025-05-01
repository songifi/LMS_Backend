import { SetMetadata } from "@nestjs/common"
import type { ContentType } from "../interfaces/cache.interfaces"

export const CACHE_KEY_METADATA = "cache_key_metadata"
export const CACHE_TTL_METADATA = "cache_ttl_metadata"
export const CACHE_CONTENT_TYPE_METADATA = "cache_content_type_metadata"

export interface CacheOptions {
  prefix: string
  ttl?: number
  contentType: ContentType
  idFromArgs?: (args: any[]) => string
  paramsFromArgs?: (args: any[]) => Record<string, any>
}

export const Cached = (options: CacheOptions) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, options)(target, key, descriptor)

    if (options.ttl) {
      SetMetadata(CACHE_TTL_METADATA, options.ttl)(target, key, descriptor)
    }

    SetMetadata(CACHE_CONTENT_TYPE_METADATA, options.contentType)(target, key, descriptor)

    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheService = this.cacheService

      if (!cacheService) {
        return originalMethod.apply(this, args)
      }

      const id = options.idFromArgs ? options.idFromArgs(args) : "default"
      const params = options.paramsFromArgs ? options.paramsFromArgs(args) : undefined

      const cacheKey = {
        prefix: options.prefix,
        id,
        params,
      }

      // Try to get from cache first
      const cachedValue = await cacheService.get(cacheKey)

      if (cachedValue !== undefined) {
        return cachedValue
      }

      // If not in cache, call the original method
      const result = await originalMethod.apply(this, args)

      // Store the result in cache
      await cacheService.set(cacheKey, result, options.contentType)

      return result
    }

    return descriptor
  }
}
