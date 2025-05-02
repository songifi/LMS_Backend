import { Injectable, Logger, type OnModuleInit } from "@nestjs/common"
import { Connection, type ConnectionOptions } from "typeorm"
import type { ConfigService } from "@nestjs/config"

@Injectable()
export class ReplicaManagerService implements OnModuleInit {
  private readonly logger = new Logger(ReplicaManagerService.name)
  private primaryConnection: Connection
  private replicaConnections: Map<string, Connection> = new Map()
  private roundRobinCounter = 0

  constructor(
    private configService: ConfigService,
    private defaultConnection: Connection,
  ) {}

  async onModuleInit() {
    this.primaryConnection = this.defaultConnection
    await this.setupReplicaConnections()
  }

  /**
   * Set up connections to read replicas
   */
  private async setupReplicaConnections(): Promise<void> {
    try {
      const replicaHosts = this.configService.get<string>("DB_REPLICA_HOSTS", "")

      if (!replicaHosts) {
        this.logger.log("No read replicas configured")
        return
      }

      const hosts = replicaHosts.split(",")

      for (let i = 0; i < hosts.length; i++) {
        const host = hosts[i].trim()

        if (!host) continue

        const replicaOptions: ConnectionOptions = {
          ...(this.primaryConnection.options as ConnectionOptions),
          name: `replica_${i}`,
          host,
          port: this.configService.get<number>("DB_REPLICA_PORT", 5432),
          username: this.configService.get<string>("DB_REPLICA_USERNAME", this.configService.get("DB_USERNAME")),
          password: this.configService.get<string>("DB_REPLICA_PASSWORD", this.configService.get("DB_PASSWORD")),
        }

        const replicaConnection = new Connection(replicaOptions)
        await replicaConnection.connect()

        this.replicaConnections.set(`replica_${i}`, replicaConnection)
        this.logger.log(`Connected to read replica ${i}: ${host}`)
      }

      this.logger.log(`Set up ${this.replicaConnections.size} read replica connections`)
    } catch (error) {
      this.logger.error(`Error setting up replica connections: ${error.message}`)
    }
  }

  /**
   * Get a connection to a read replica using round-robin
   */
  getReplicaConnection(): Connection {
    if (this.replicaConnections.size === 0) {
      return this.primaryConnection
    }

    const replicaKeys = Array.from(this.replicaConnections.keys())
    const replicaKey = replicaKeys[this.roundRobinCounter % replicaKeys.length]
    this.roundRobinCounter++

    return this.replicaConnections.get(replicaKey)
  }

  /**
   * Execute a read query on a replica
   */
  async executeReadQuery<T>(query: string, parameters: any[] = []): Promise<T> {
    const connection = this.getReplicaConnection()
    const queryRunner = connection.createQueryRunner()

    try {
      await queryRunner.connect()
      return await queryRunner.query(query, parameters)
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Execute a write query on the primary
   */
  async executeWriteQuery<T>(query: string, parameters: any[] = []): Promise<T> {
    const queryRunner = this.primaryConnection.createQueryRunner()

    try {
      await queryRunner.connect()
      return await queryRunner.query(query, parameters)
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Check health of all replica connections
   */
  async checkReplicaHealth(): Promise<{
    healthy: boolean
    replicaStatus: Record<string, boolean>
  }> {
    const replicaStatus: Record<string, boolean> = {}
    let allHealthy = true

    // Check primary connection
    try {
      await this.primaryConnection.query("SELECT 1")
      replicaStatus["primary"] = true
    } catch (error) {
      replicaStatus["primary"] = false
      allHealthy = false
      this.logger.error(`Primary connection health check failed: ${error.message}`)
    }

    // Check replica connections
    for (const [name, connection] of this.replicaConnections.entries()) {
      try {
        await connection.query("SELECT 1")
        replicaStatus[name] = true
      } catch (error) {
        replicaStatus[name] = false
        allHealthy = false
        this.logger.error(`Replica ${name} health check failed: ${error.message}`)
      }
    }

    return {
      healthy: allHealthy,
      replicaStatus,
    }
  }

  /**
   * Get replica lag information
   */
  async getReplicaLag(): Promise<Record<string, number>> {
    const lagInfo: Record<string, number> = {}

    // For each replica, check the replication lag
    for (const [name, connection] of this.replicaConnections.entries()) {
      try {
        // This query works for PostgreSQL to get replication lag in seconds
        const result = await connection.query(`
          SELECT 
            EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) as lag_seconds
        `)

        lagInfo[name] = Number.parseFloat(result[0].lag_seconds) || 0
      } catch (error) {
        this.logger.error(`Error getting replica lag for ${name}: ${error.message}`)
        lagInfo[name] = -1 // Indicate error
      }
    }

    return lagInfo
  }

  /**
   * Get configuration for read replicas
   */
  getReplicaConfiguration(): {
    primaryHost: string
    replicaHosts: string[]
    replicaCount: number
  } {
    const primaryOptions = this.primaryConnection.options as ConnectionOptions
    const replicaHosts = Array.from(this.replicaConnections.values()).map(
      (conn) => (conn.options as ConnectionOptions).host,
    )

    return {
      primaryHost: primaryOptions.host as string,
      replicaHosts,
      replicaCount: this.replicaConnections.size,
    }
  }
}
