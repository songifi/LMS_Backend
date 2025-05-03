import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/sync')
export class SyncController {
  constructor(private syncService: SyncService) {}
  
  @UseGuards(JwtAuthGuard)
  @Post('assignments')
  async syncAssignmentSubmissions(@Body() data: any, @Req() req) {
    const userId = req.user.id;
    return this.syncService.processAssignmentSubmissions(data, userId);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('progress')
  async syncUserProgress(@Body() data: any, @Req() req) {
    const userId = req.user.id;
    return this.syncService.processUserProgress(data, userId);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('content-changes')
  async getContentChanges(@Body() data: any) {
    return this.syncService.getContentChanges(data.lastSyncTimestamp);
  }
}