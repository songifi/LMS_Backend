import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from "@nestjs/common"
import { type Observable, of } from "rxjs"
import { tap } from "rxjs/operators"
import type { CacheService } from "../services/cache.service"
import { ContentType } from "../interfaces/cache.interfaces"
import type { Reflector } from "@nestjs/core"
import { CACHE_KEY_METADATA, CACHE_CONTENT_TYPE_METADATA } from "../decorators/cached.decorator"

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest()

    // Skip caching for non-GET requests
    if (request.method !== "GET") {
      return next.handle()
    }

    const handler = context.getHandler()
    const cacheOptions = this.reflector.get(CACHE_KEY_METADATA, handler)

    if (!cacheOptions) {
      return next.handle()
    }

    const contentType = this.reflector.get<ContentType>(CACHE_CONTENT_TYPE_METADATA, handler) || ContentType.STATIC

    // Build cache key from request
    const cacheKey = {
      prefix: cacheOptions.prefix,
      id: request.params.id || "default",
      params: request.query,
    }

    // Try to get from cache
    const cachedValue = await this.cacheService.get(cacheKey)

    if (cachedValue !== undefined) {
      return of(cachedValue)
    }

    // If not in cache, call the handler and cache the result
    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheService.set(cacheKey, response, contentType)
      }),
    )
  }
}
