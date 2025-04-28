import type { TypeOrmModuleOptions } from "@nestjs/typeorm"
import type { ConfigService } from "@nestjs/config"

/**
 * Creates TypeORM configuration with optimized PostgreSQL settings
 * @param configService The NestJS config service
 * @returns TypeORM configuration options
 */
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: "postgres",
    host: configService.get("DATABASE_HOST"),
    port: configService.get<number>("DATABASE_PORT"),
    username: configService.get("DATABASE_USER"),
    password: configService.get<string>("DATABASE_PASSWORD"),
    database: configService.get("DATABASE_NAME"),
    entities: [__dirname + "/../**/*.entity{.ts,.js}"],
    synchronize: configService.get("NODE_ENV") !== "production",
    logging: configService.get("NODE_ENV") !== "production",

    // Connection pool optimization
    poolSize: configService.get<number>("DATABASE_POOL_SIZE") || 10,
    maxQueryExecutionTime: 1000, // Log queries taking longer than 1 second

    // Query execution settings
    connectTimeoutMS: 10000,
    extra: {
      // PostgreSQL specific settings
      max: configService.get<number>("DATABASE_POOL_SIZE") || 10,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      // Statement timeout (5 minutes)
      statement_timeout: 300000,
      // SSL configuration for production
      ssl: configService.get("NODE_ENV") === "production" ? { rejectUnauthorized: false } : false,
    },

    // Cache settings
    cache: {
      duration: 60000, // 1 minute cache duration
      type: "database",
    },

    // Migrations configuration
    migrations: [__dirname + "/../migrations/**/*{.ts,.js}"],
    migrationsRun: configService.get("RUN_MIGRATIONS") === "true",
    migrationsTableName: "migrations",
  }
}
