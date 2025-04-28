import type { TypeOrmModuleOptions } from "@nestjs/typeorm"
import type { ConfigService } from "@nestjs/config"
import * as fs from "fs"

/**
 * Creates TypeORM configuration with enhanced security settings
 * @param configService The NestJS config service
 * @returns TypeORM configuration options with security enhancements
 */
export const getSecureDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
    const isProduction = configService.get("NODE_ENV") === "production"
  
    const sslCertPath = configService.get("SSL_CERT_PATH")
    const sslKeyPath = configService.get("SSL_KEY_PATH")
    const sslCaPath = configService.get("SSL_CA_PATH")
  
    const useCustomSSL = isProduction && sslCertPath && sslKeyPath
  
    const config: TypeOrmModuleOptions = {
      type: "postgres",
      host: configService.get("DATABASE_HOST"),
      port: configService.get<number>("DATABASE_PORT"),
      username: configService.get("DATABASE_USER"),
      password: configService.get<string>("DATABASE_PASSWORD"),
      database: configService.get("DATABASE_NAME"),
      entities: [__dirname + "/../**/*.entity{.ts,.js}"],
      synchronize: !isProduction,
      logging: !isProduction,
  
      poolSize: configService.get<number>("DATABASE_POOL_SIZE") || 10,
      maxQueryExecutionTime: 1000,
      connectTimeoutMS: 10000,
      extra: {
        max: configService.get<number>("DATABASE_POOL_SIZE") || 10,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        statement_timeout: 300000,
      },
  
      cache: {
        duration: 60000,
        type: "database",
      },
  
      migrations: [__dirname + "/../migrations/**/*{.ts,.js}"],
      migrationsRun: configService.get("RUN_MIGRATIONS") === "true",
      migrationsTableName: "migrations",
  
      // ✅ Now set SSL during object creation
      ssl: isProduction
        ? (useCustomSSL
          ? {
              rejectUnauthorized: true,
              cert: fs.readFileSync(sslCertPath).toString(),
              key: fs.readFileSync(sslKeyPath).toString(),
              ca: sslCaPath ? fs.readFileSync(sslCaPath).toString() : undefined,
            }
          : { rejectUnauthorized: false })
        : undefined, // no SSL in development
    }
  
    return config
  }
  