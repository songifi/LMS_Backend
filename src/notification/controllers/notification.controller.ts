import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from "@nestjs/common"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { NotificationService } from "../providers/notification.service"
import { CreateNotificationDto } from "../dto/create-notification.dto"
import { UpdateNotificationDto } from "../dto/update-notification.dto"
import { QueryNotificationsDto } from "../dto/query-notifications.dto"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from "@nestjs/swagger"

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: "Get user notifications" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns a list of notifications and total count",
  })
  async findAll(@Request() req, @Query() query: QueryNotificationsDto) {
    const userId = req.user.id
    const [notifications, total] = await this.notificationService.findAll(userId, query)

    return {
      success: true,
      data: {
        notifications,
        total,
        unreadCount: await this.notificationService.getUnreadCount(userId),
      },
    }
  }

  @Post()
  @ApiOperation({ summary: "Create a notification (admin only)" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Notification created successfully",
  })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    const notification = await this.notificationService.create(createNotificationDto)
    
    return {
      success: true,
      data: notification,
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get notification details" })
  @ApiParam({ name: "id", description: "Notification ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns notification details",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Notification not found",
  })
  async findOne(@Param("id") id: string, @Request() req) {
    const notification = await this.notificationService.findOne(id, req.user.id)

    return {
      success: true,
      data: notification,
    }
  }

  @Put(":id")
  @ApiOperation({ summary: "Update notification (mark as read)" })
  @ApiParam({ name: "id", description: "Notification ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notification updated successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Notification not found",
  })
  async update(@Param("id") id: string, @Body() updateNotificationDto: UpdateNotificationDto, @Request() req) {
    const notification = await this.notificationService.update(id, req.user.id, updateNotificationDto)

    return {
      success: true,
      data: notification,
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove notification" })
  @ApiParam({ name: "id", description: "Notification ID" })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Notification removed successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Notification not found",
  })
  async remove(@Param("id") id: string, @Request() req) {
    await this.notificationService.remove(id, req.user.id)
  }

  @Put("mark-all-read")
  @ApiOperation({ summary: "Mark all notifications as read" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "All notifications marked as read",
  })
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.id)
    
    return {
      success: true,
      message: "All notifications marked as read",
    }
  }
}
