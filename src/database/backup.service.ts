import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Cron, CronExpression } from "@nestjs/schedule"
import { exec } from "child_process"
import { promisify } from "util"
import * as fs from "fs"
import * as path from "path"

const execPromise = promisify(exec)

@Injectable()
export class DatabaseBackupService {
  private readonly logger = new Logger(DatabaseBackupService.name)
  private readonly backupDir: string

  constructor(private configService: ConfigService) {
    // Create backup directory if it doesn't exist
    this.backupDir = path.join(process.cwd(), "backups")
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  /**
   * Performs a database backup daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async performDailyBackup() {
    try {
      await this.createBackup("daily")
      this.logger.log("Daily database backup completed successfully")

      // Clean up old daily backups (keep last 7 days)
      await this.cleanupOldBackups("daily", 7)
    } catch (error) {
      this.logger.error(`Daily backup failed: ${error.message}`)
    }
  }

  /**
   * Performs a database backup weekly on Sunday at 1 AM
   */
  @Cron(CronExpression.EVERY_WEEK)
  async performWeeklyBackup() {
    try {
      await this.createBackup("weekly")
      this.logger.log("Weekly database backup completed successfully")

      // Clean up old weekly backups (keep last 4 weeks)
      await this.cleanupOldBackups("weekly", 4)
    } catch (error) {
      this.logger.error(`Weekly backup failed: ${error.message}`)
    }
  }

  /**
   * Performs a database backup monthly on the 1st at 2 AM
   */
  @Cron("0 2 1 * *")
  async performMonthlyBackup() {
    try {
      await this.createBackup("monthly")
      this.logger.log("Monthly database backup completed successfully")

      // Clean up old monthly backups (keep last 12 months)
      await this.cleanupOldBackups("monthly", 12)
    } catch (error) {
      this.logger.error(`Monthly backup failed: ${error.message}`)
    }
  }

  /**
   * Creates a database backup
   * @param backupType Type of backup (daily, weekly, monthly)
   */
  async createBackup(backupType: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupFileName = `${backupType}_backup_${timestamp}.sql`
    const backupPath = path.join(this.backupDir, backupFileName)

    const dbHost = this.configService.get("DATABASE_HOST")
    const dbPort = this.configService.get("DATABASE_PORT")
    const dbName = this.configService.get("DATABASE_NAME")
    const dbUser = this.configService.get("DATABASE_USER")
    const dbPassword = this.configService.get("DATABASE_PASSWORD")

    // Set PGPASSWORD environment variable for pg_dump
    process.env.PGPASSWORD = dbPassword

    const command = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f ${backupPath}`

    try {
      await execPromise(command)

      // Compress the backup file
      const gzipCommand = `gzip ${backupPath}`
      await execPromise(gzipCommand)

      return `${backupPath}.gz`
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`)
      throw error
    } finally {
      // Clear PGPASSWORD environment variable
      delete process.env.PGPASSWORD
    }
  }

  /**
   * Cleans up old backups, keeping a specified number of the most recent ones
   * @param backupType Type of backup (daily, weekly, monthly)
   * @param keepCount Number of backups to keep
   */
  async cleanupOldBackups(backupType: string, keepCount: number): Promise<void> {
    const files = fs
      .readdirSync(this.backupDir)
      .filter((file) => file.startsWith(`${backupType}_backup_`) && file.endsWith(".sql.gz"))
      .sort()
      .reverse() // Sort in descending order (newest first)

    if (files.length <= keepCount) {
      return // No need to delete if we have fewer than keepCount
    }

    // Delete older backups
    const filesToDelete = files.slice(keepCount)
    for (const file of filesToDelete) {
      const filePath = path.join(this.backupDir, file)
      fs.unlinkSync(filePath)
      this.logger.log(`Deleted old backup: ${file}`)
    }
  }

  /**
   * Manually triggers a backup
   * @returns Path to the created backup file
   */
  async manualBackup(): Promise<string> {
    try {
      const backupPath = await this.createBackup("manual")
      this.logger.log("Manual backup completed successfully")
      return backupPath
    } catch (error) {
      this.logger.error(`Manual backup failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Restores a database from a backup file
   * @param backupFilePath Path to the backup file
   */
  async restoreFromBackup(backupFilePath: string): Promise<void> {
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`)
    }

    const dbHost = this.configService.get("DATABASE_HOST")
    const dbPort = this.configService.get("DATABASE_PORT")
    const dbName = this.configService.get("DATABASE_NAME")
    const dbUser = this.configService.get("DATABASE_USER")
    const dbPassword = this.configService.get("DATABASE_PASSWORD")

    // Set PGPASSWORD environment variable for psql
    process.env.PGPASSWORD = dbPassword

    try {
      // If the file is compressed, decompress it first
      let restoreFilePath = backupFilePath
      if (backupFilePath.endsWith(".gz")) {
        const decompressCommand = `gunzip -c ${backupFilePath} > ${backupFilePath.slice(0, -3)}`
        await execPromise(decompressCommand)
        restoreFilePath = backupFilePath.slice(0, -3)
      }

      // Restore the database
      const command = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f ${restoreFilePath}`
      await execPromise(command)

      this.logger.log(`Database restored successfully from ${backupFilePath}`)

      // Clean up decompressed file if needed
      if (restoreFilePath !== backupFilePath) {
        fs.unlinkSync(restoreFilePath)
      }
    } catch (error) {
      this.logger.error(`Restore failed: ${error.message}`)
      throw error
    } finally {
      // Clear PGPASSWORD environment variable
      delete process.env.PGPASSWORD
    }
  }
}
