import { Injectable, Logger } from "@nestjs/common"
import type { MigrationService } from "../migration.service"
import type { MigrationVerificationService } from "../verification/migration-verification.service"
import type { MigrationPerformanceService } from "../performance/migration-performance.service"
import type { IMigration } from "../interfaces/migration.interface"

export interface CiCdPipelineOptions {
  environment: "development" | "staging" | "production"
  autoApprove: boolean
  performanceThreshold: number // percentage of acceptable performance degradation
  notificationEndpoint?: string
  dryRun?: boolean
}

@Injectable()
export class CiCdIntegrationService {
  private readonly logger = new Logger(CiCdIntegrationService.name)

  constructor(
    private migrationService: MigrationService,
    private verificationService: MigrationVerificationService,
    private performanceService: MigrationPerformanceService,
  ) {}

  async runPipelineMigration(options: CiCdPipelineOptions): Promise<boolean> {
    this.logger.log(`Starting CI/CD pipeline migration for ${options.environment} environment`)

    try {
      // Step 1: Verify all pending migrations
      const pendingMigrations = await this.getPendingMigrations()

      if (pendingMigrations.length === 0) {
        this.logger.log("No pending migrations to apply")
        return true
      }

      this.logger.log(`Found ${pendingMigrations.length} pending migrations`)

      // Step 2: Validate migrations
      const isValid = await this.migrationService.verifyMigrations(pendingMigrations)

      if (!isValid) {
        this.logger.error("Migration validation failed")
        await this.sendNotification(options, "Migration validation failed", "error")
        return false
      }

      // Step 3: Capture performance baseline
      const baselineSnapshot = await this.performanceService.capturePerformanceSnapshot()

      // Step 4: Run migrations in dry-run mode first
      if (options.environment === "production" || options.dryRun) {
        this.logger.log("Running migrations in dry-run mode")
        await this.migrationService.applyMigrations({ dryRun: true })
      }

      // Step 5: Apply migrations if not in dry-run mode
      if (!options.dryRun) {
        this.logger.log("Applying migrations")
        await this.migrationService.applyMigrations()
      }

      // Step 6: Capture post-migration performance
      const postMigrationSnapshot = await this.performanceService.capturePerformanceSnapshot()

      // Step 7: Analyze performance impact
      const performanceImpact = this.performanceService.analyzePerformanceImpact(
        baselineSnapshot,
        postMigrationSnapshot,
      )

      // Step 8: Check if performance degradation is within acceptable threshold
      const hasPerformanceIssues = this.checkPerformanceIssues(performanceImpact, options.performanceThreshold)

      if (hasPerformanceIssues) {
        this.logger.warn("Performance degradation detected above threshold")

        // For production, we might want to rollback or require manual approval
        if (options.environment === "production" && !options.autoApprove) {
          this.logger.warn("Waiting for manual approval due to performance concerns")
          await this.sendNotification(
            options,
            "Migration caused performance degradation, manual approval required",
            "warning",
          )
          return false
        }
      }

      // Step 9: Send success notification
      await this.sendNotification(options, `Successfully applied ${pendingMigrations.length} migrations`, "success")

      return true
    } catch (error) {
      this.logger.error("CI/CD pipeline migration failed", error.stack)
      await this.sendNotification(options, `Migration failed: ${error.message}`, "error")
      return false
    }
  }

  private async getPendingMigrations(): Promise<IMigration[]> {
    // This is a simplified version - in reality, we would use the migration service
    // to get the actual pending migrations
    return []
  }

  private checkPerformanceIssues(performanceImpact: any, threshold: number): boolean {
    // Check if any table grew beyond threshold
    const tableGrowthIssue = Object.values(performanceImpact.tableGrowth).some((growth: number) => growth > threshold)

    // Check if any query slowed down beyond threshold
    const queryPerformanceIssue = performanceImpact.slowedQueries.some(
      (query: any) => query.avgExecutionTimeMs > 1000, // More than 1 second
    )

    return tableGrowthIssue || queryPerformanceIssue
  }

  private async sendNotification(
    options: CiCdPipelineOptions,
    message: string,
    level: "info" | "warning" | "error" | "success",
  ): Promise<void> {
    if (!options.notificationEndpoint) {
      return
    }

    try {
      // Send notification to configured endpoint (e.g., Slack, Teams, etc.)
      const response = await fetch(options.notificationEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          environment: options.environment,
          message,
          level,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        this.logger.error(`Failed to send notification: ${response.statusText}`)
      }
    } catch (error) {
      this.logger.error("Failed to send notification", error)
    }
  }
}
