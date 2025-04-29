import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from "@nestjs/common"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger"
import { GuardianService } from "../providers/guardian.service";
import { CreateGuardianDto } from "../dto/create-guardian.dto";
import { Guardian } from "../entities/guardian.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { GuardianRelationship } from "../entities/guardian-relationship.entity";
import { CreateRelationshipDto } from "../dto/create-relationship.dto";
import { ProgressSnapshot } from "../entities/progress-snapshot.entity";
import { CreateMessageDto } from "../dto/create-message.dto";
import { GuardianMessage } from "../entities/guardian-message.entity";
import { GuardianNotification } from "../entities/guardian-notification.entity";
import { UpdatePermissionDto } from "../dto/update-permission.dto";
import { PermissionGrant } from "../entities/permission-grant.entity";

@ApiTags("guardians")
@Controller("guardians")
export class GuardianController {
  constructor(private readonly guardianService: GuardianService) {}

  @Post()
  @ApiOperation({ summary: 'Register as guardian' })
  @ApiResponse({ status: 201, description: 'Guardian successfully registered', type: Guardian })
  @ApiBadRequestResponse({ description: 'Invalid input or guardian already exists' })
  async createGuardian(@Body() createGuardianDto: CreateGuardianDto): Promise<Guardian> {
    return this.guardianService.createGuardian(createGuardianDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dependents')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dependent students' })
  @ApiResponse({ status: 200, description: 'List of dependent students', type: [GuardianRelationship] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getDependents(@Request() req): Promise<GuardianRelationship[]> {
    return this.guardianService.getDependents(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("relationships")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Connect to dependent" })
  @ApiBody({ type: CreateRelationshipDto })
  @ApiResponse({ status: 201, description: "Relationship successfully created", type: GuardianRelationship })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiBadRequestResponse({ description: "Invalid input or relationship already exists" })
  async createRelationship(
    @Request() req,
    @Body() createRelationshipDto: CreateRelationshipDto,
  ): Promise<GuardianRelationship> {
    return this.guardianService.createRelationship(req.user.id, createRelationshipDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get("progress/:studentId")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get student progress" })
  @ApiParam({ name: "studentId", description: "ID of the student" })
  @ApiResponse({ status: 200, description: "Student progress data", type: [ProgressSnapshot] })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden - No permission to view progress" })
  @ApiNotFoundResponse({ description: "Relationship not found" })
  async getStudentProgress(@Request() req, @Param('studentId') studentId: string): Promise<ProgressSnapshot[]> {
    return this.guardianService.getStudentProgress(req.user.id, studentId)
  }

  @UseGuards(JwtAuthGuard)
  @Post("messages")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Send message to instructor" })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({ status: 201, description: "Message successfully sent", type: GuardianMessage })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden - No permission to contact instructors" })
  async sendMessage(@Request() req, @Body() createMessageDto: CreateMessageDto): Promise<GuardianMessage> {
    return this.guardianService.sendMessage(req.user.id, createMessageDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get guardian notifications' })
  @ApiResponse({ status: 200, description: 'List of notifications', type: [GuardianNotification] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getNotifications(@Request() req): Promise<GuardianNotification[]> {
    return this.guardianService.getNotifications(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put("permissions")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update access permissions" })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({ status: 200, description: "Permission successfully updated", type: PermissionGrant })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiNotFoundResponse({ description: "Relationship not found" })
  @ApiBadRequestResponse({ description: "Invalid input" })
  async updatePermission(@Request() req, @Body() updatePermissionDto: UpdatePermissionDto): Promise<PermissionGrant> {
    return this.guardianService.updatePermission(req.user.id, updatePermissionDto)
  }
}
