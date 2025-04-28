import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler, Logger } from "@nestjs/common"
import type { Observable } from "rxjs"
import { tap } from "rxjs/operators"
import type { ConfigService } from "@nestjs/config"

/**
 * Interceptor to log slow queries and API requests
 */
@Injectable()
export class QueryLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(QueryLoggerInterceptor.name)
  private readonly slowQueryThreshold: number

  constructor(private configService: ConfigService) {
    // Get threshold from config or use default of 1000ms
    this.slowQueryThreshold = configService.get<number>("SLOW_QUERY_THRESHOLD") || 1000
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, body, query, params } = request
    const userAgent = request.headers["user-agent"] || "unknown"
    const startTime = Date.now()

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now()
          const executionTime = endTime - startTime

          // Log slow requests
          if (executionTime > this.slowQueryThreshold) {
            this.logger.warn(`Slow request: ${method} ${url} - ${executionTime}ms`, {
              method,
              url,
              body,
              query,
              params,
              userAgent,
              executionTime,
            })
          }

          // Log all requests in development
          if (this.configService.get("NODE_ENV") !== "production") {
            this.logger.debug(`Request: ${method} ${url} - ${executionTime}ms`, {
              method,
              url,
              executionTime,
            })
          }
        },
        error: (error) => {
          const endTime = Date.now()
          const executionTime = endTime - startTime

          this.logger.error(`Request error: ${method} ${url} - ${executionTime}ms - ${error.message}`, {
            method,
            url,
            body,
            query,
            params,
            userAgent,
            executionTime,
            error: error.stack,
          })
        },
      }),
    )
  }
}
