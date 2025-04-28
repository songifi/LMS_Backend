import { Controller, Get, Put, Body, UseGuards, Request, HttpStatus } from "@nestjs/common"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { NotificationPreferenceService } from "../providers/notification-preference.service"
import { UpdatePreferencesDto } from "../dto/update-preferences.dto"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger"

@ApiTags("notification-preferences")
@Controller("notification-preferences")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class NotificationPreferenceController {
  constructor(private readonly preferenceService: NotificationPreferenceService) {}

  @Get()
  @ApiOperation({ summary: "Get user notification preferences" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns user notification preferences",
  })
  async getUserPreferences(@Request() req) {
    const preferences = await this.preferenceService.getUserPreferences(req.user.id);

    return {
      success: true,
      data: preferences,
    };
  }

  @Put()
  @ApiOperation({ summary: "Update notification preferences" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Preferences updated successfully",
  })
  async updatePreferences(@Body() updatePreferencesDto: UpdatePreferencesDto, @Request() req) {
    const preferences = await this.preferenceService.updatePreferences(req.user.id, updatePreferencesDto.preferences)

    return {
      success: true,
      data: preferences,
    }
  }

  @Get("initialize")
  @ApiOperation({ summary: "Initialize default notification preferences" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Default preferences initialized",
  })
  async initializePreferences(@Request() req) {
    const preferences = await this.preferenceService.initializeUserPreferences(req.user.id)
    
    return {
      success: true,
      data: preferences,
    }
  }
}
