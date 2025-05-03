import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/content')
export class ContentController {
  constructor(private contentService: ContentService) {}
  
  @UseGuards(JwtAuthGuard)
  @Get('courses/:id')
  async getCourseContent(
    @Param('id') courseId: number,
    @Query('connection') connection: 'slow' | 'medium' | 'fast' = 'medium',
    @Query('bandwidth') bandwidth: number = 5,
    @Query('storage') deviceStorage: number = 5000,
    @Req() req
  ) {
    const userId = req.user.id;
    
    return this.contentService.getCourseContent(courseId, {
      connection,
      bandwidth,
      deviceStorage
    });
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('materials/:id')
  async getMaterialContent(
    @Param('id') materialId: number,
    @Query('connection') connection: 'slow' | 'medium' | 'fast' = 'medium',
    @Query('bandwidth') bandwidth: number = 5,
    @Query('storage') deviceStorage: number = 5000,
    @Req() req
  ) {
    const userId = req.user.id;
    
    // Implementation details...
  }
}