import { Controller, Get, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/role.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { RoleEnum } from "../user/role.enum"
import { InjectConnection } from "@nestjs/typeorm"
import type { Connection } from "typeorm"
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger"

@ApiTags("database-health")
@Controller("database-health")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.SUPER_ADMIN)
export class DatabaseHealthController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get database health status" })
  @ApiOkResponse({
    description: "Database health information",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "healthy" },
        connected: { type: "boolean", example: true },
        version: { type: "string", example: "PostgreSQL 14.5" },
        metrics: {
          type: "object",
          properties: {
            activeConnections: { type: "number", example: 5 },
            idleConnections: { type: "number", example: 10 },
            maxConnections: { type: "number", example: 100 },
            uptime: { type: "string", example: "10 days, 5 hours" },
            databaseSize: { type: "string", example: "250MB" },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role" })
  async getDatabaseHealth() {
    // Check if database is connected
    const isConnected = this.connection.isConnected

    // Get database version and metrics
    let version = "Unknown"
    let metrics = {}

    if (isConnected) {
      try {
        // Get PostgreSQL version
        const versionResult = await this.connection.query("SELECT version()")
        version = versionResult[0].version

        // Get connection metrics
        const connectionMetrics = await this.connection.query(`
          SELECT 
            count(*) FILTER (WHERE state = 'active') as active_connections,
            count(*) FILTER (WHERE state = 'idle') as idle_connections,
            (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
        `)

        // Get uptime
        const uptimeResult = await this.connection.query(`
          SELECT date_trunc('second', current_timestamp - pg_postmaster_start_time()) as uptime
        `)

        // Get database size
        const sizeResult = await this.connection.query(`
          SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `)

        metrics = {
          activeConnections: Number.parseInt(connectionMetrics[0].active_connections),
          idleConnections: Number.parseInt(connectionMetrics[0].idle_connections),
          maxConnections: Number.parseInt(connectionMetrics[0].max_connections),
          uptime: uptimeResult[0].uptime,
          databaseSize: sizeResult[0].size,
        }
      } catch (error) {
        console.error("Error fetching database metrics:", error)
      }
    }

    return {
      status: isConnected ? "healthy" : "unhealthy",
      connected: isConnected,
      version,
      metrics,
    }
  }
}
