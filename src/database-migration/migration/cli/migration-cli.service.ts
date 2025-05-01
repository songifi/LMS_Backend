import { Injectable, Logger } from "@nestjs/common"
import { Command } from "commander"
import * as chalk from "chalk"
import type { MigrationService } from "../migration.service"
import type { MigrationGenerator } from "../generators/migration-generator.service"
import type { MigrationRollbackService } from "../rollback/migration-rollback.service"
import type { MigrationPerformanceService } from "../performance/migration-performance.service"

@Injectable()
export class MigrationCliService {
  private readonly logger = new Logger(MigrationCliService.name)
  private program: Command

  constructor(
    private migrationService: MigrationService,
    private migrationGenerator: MigrationGenerator,
    private rollbackService: MigrationRollbackService,
    private performanceService: MigrationPerformanceService,
  ) {
    this.setupCliCommands()
  }

  private setupCliCommands(): void {
    this.program = new Command()

    this.program.name("migration-cli").description("Database migration management tool").version("1.0.0")

    this.program
      .command("migrate")
      .description("Run pending migrations")
      .option("-d, --dry-run", "Show migrations that would be run without executing them")
      .option("-s, --single <name>", "Run only a specific migration")
      .option("-v, --verify-only", "Only verify migrations without running them")
      .action(async (options) => {
        try {
          console.log(chalk.blue("Running migrations..."))
          await this.migrationService.applyMigrations({
            dryRun: options.dryRun,
            single: options.single,
            verifyOnly: options.verifyOnly,
          })
          console.log(chalk.green("Migration completed successfully"))
        } catch (error) {
          console.error(chalk.red("Migration failed:"), error.message)
          process.exit(1)
        }
      })

    this.program
      .command("rollback")
      .description("Rollback the last migration or to a specific point")
      .option("-l, --last", "Rollback only the last migration")
      .option("-t, --to <name>", "Rollback to a specific migration")
      .option("-b, --batch", "Rollback the last batch of migrations")
      .action(async (options) => {
        try {
          console.log(chalk.blue("Rolling back migrations..."))

          if (options.to) {
            await this.rollbackService.rollbackToMigration(options.to)
          } else if (options.batch) {
            await this.rollbackService.rollbackLastBatch()
          } else {
            await this.migrationService.rollbackLastMigration()
          }

          console.log(chalk.green("Rollback completed successfully"))
        } catch (error) {
          console.error(chalk.red("Rollback failed:"), error.message)
          process.exit(1)
        }
      })

    this.program
      .command("generate")
      .description("Generate a new migration file")
      .argument("<name>", "Name of the migration")
      .option("-e, --empty", "Generate an empty migration")
      .option("-t, --type <type>", "Migration type (standard or zero-downtime)", "standard")
      .option("-d, --data <table>", "Generate a data migration for the specified table")
      .option("-i, --index <table>", "Generate an index migration for the specified table")
      .option("-c, --columns <columns>", "Column names for index (comma separated)")
      .action(async (name, options) => {
        try {
          console.log(chalk.blue(`Generating migration: ${name}`))

          let filePath: string

          if (options.data) {
            filePath = await this.migrationGenerator.generateDataMigration(options.data, {
              batchSize: 1000,
            })
          } else if (options.index && options.columns) {
            const columns = options.columns.split(",").map((c) => c.trim())
            filePath = await this.migrationGenerator.generateIndexMigration(options.index, columns)
          } else {
            filePath = await this.migrationGenerator.generateMigration({
              name,
              empty: options.empty,
              addTimestamp: true,
              type: options.type,
            })
          }

          console.log(chalk.green(`Migration file generated: ${filePath}`))
        } catch (error) {
          console.error(chalk.red("Generation failed:"), error.message)
          process.exit(1)
        }
      })

    this.program
      .command("status")
      .description("Show migration status")
      .action(async () => {
        try {
          const migrations = await this.migrationService.getExecutedMigrations()
          const history = await this.migrationService.getMigrationHistory()

          console.log(chalk.blue("Migration Status:"))
          console.log(chalk.yellow("Executed Migrations:"))

          if (migrations.length === 0) {
            console.log("  No migrations have been executed yet")
          } else {
            migrations.forEach((migration) => {
              const status =
                migration.status === "COMPLETED" ? chalk.green(migration.status) : chalk.red(migration.status)

              console.log(`  ${migration.name} - ${status} (${new Date(migration.executedAt).toLocaleString()})`)
            })
          }

          console.log(chalk.yellow("\nRecent History:"))

          if (history.length === 0) {
            console.log("  No migration history available")
          } else {
            history.slice(0, 10).forEach((entry) => {
              const operation = chalk.cyan(entry.operation)
              console.log(`  ${new Date(entry.timestamp).toLocaleString()} - ${operation} - ${entry.migrationName}`)
              if (entry.errorMessage) {
                console.log(`    Error: ${chalk.red(entry.errorMessage)}`)
              }
            })
          }
        } catch (error) {
          console.error(chalk.red("Failed to get migration status:"), error.message)
          process.exit(1)
        }
      })

    this.program
      .command("analyze")
      .description("Analyze migration performance")
      .action(async () => {
        try {
          console.log(chalk.blue("Capturing database performance snapshot..."))
          const snapshot = await this.performanceService.capturePerformanceSnapshot()

          console.log(chalk.green("Performance Snapshot:"))
          console.log(chalk.yellow("Table Statistics:"))

          Object.values(snapshot.tableStats).forEach((table) => {
            console.log(`  ${table.tableName}:`)
            console.log(`    Rows: ${table.rowCount.toLocaleString()}`)
            console.log(`    Size: ${(table.sizeBytes / (1024 * 1024)).toFixed(2)} MB`)
            console.log(`    Read Throughput: ${table.readThroughput.toFixed(2)} rows/sec`)
            console.log(`    Write Throughput: ${table.writeThroughput.toFixed(2)} rows/sec`)
          })

          console.log(chalk.yellow("\nSlow Queries:"))

          snapshot.queryStats
            .sort((a, b) => b.avgExecutionTimeMs - a.avgExecutionTimeMs)
            .slice(0, 5)
            .forEach((query) => {
              console.log(`  Pattern: ${query.queryPattern.substring(0, 80)}...`)
              console.log(`    Avg Time: ${query.avgExecutionTimeMs.toFixed(2)} ms`)
              console.log(`    Call Count: ${query.callCount.toLocaleString()}`)
              console.log(`    Rows Processed: ${query.rowsProcessed.toLocaleString()}`)
            })
        } catch (error) {
          console.error(chalk.red("Analysis failed:"), error.message)
          process.exit(1)
        }
      })
  }

  async run(args: string[] = process.argv): Promise<void> {
    try {
      await this.program.parseAsync(args)
    } catch (error) {
      this.logger.error("CLI command failed", error.stack)
      process.exit(1)
    }
  }
}
