import { Controller, Post, Get, UseGuards, Body } from "@nestjs/common"
import { DatabaseBackupService } from "./backup.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/role.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { RoleEnum } from "../user/role.enum"
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger"

@ApiTags("database-admin")
@Controller("database-admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.SUPER_ADMIN)
export class DatabaseAdminController {
  constructor(private readonly databaseBackupService: DatabaseBackupService) {}

  @Post("backup")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Create a manual database backup" })
  @ApiCreatedResponse({
    description: "Backup created successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        backupPath: { type: "string", example: "/app/backups/manual_backup_2023-10-15T12-30-45.sql.gz" },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role" })
  async createBackup() {
    const backupPath = await this.databaseBackupService.manualBackup()
    return {
      success: true,
      backupPath,
    }
  }

  @Get("backups")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "List all available backups" })
  @ApiOkResponse({ description: "List of available backups" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role" })
  async listBackups() {
    // Implementation would list files in the backup directory
    return {
      success: true,
      backups: [
        { name: "daily_backup_2023-10-15.sql.gz", size: "25MB", createdAt: "2023-10-15T00:00:00Z" },
        { name: "weekly_backup_2023-10-15.sql.gz", size: "25MB", createdAt: "2023-10-15T01:00:00Z" },
        { name: "manual_backup_2023-10-15.sql.gz", size: "25MB", createdAt: "2023-10-15T12:30:45Z" },
      ],
    }
  }

  @Post('restore')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Restore database from backup' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        backupPath: { type: 'string', example: '/app/backups/manual_backup_2023-10-15T12-30-45.sql.gz' }
      },
      required: ['backupPath']
    }
  })
  @ApiOkResponse({ 
    description: 'Database restored successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Database restored successfully' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have required role' })
  async restoreBackup(@Body('backupPath') backupPath: string) {
    try {
      await this.databaseBackupService.restoreFromBackup(backupPath);
      return {
        success: true,
        message: 'Database restored successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Database restore failed: ${error.message}`
      };
    }
  }
}
