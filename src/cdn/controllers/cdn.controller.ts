import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Param, 
  Body, 
  Query, 
  UseInterceptors, 
  UploadedFile,
  Headers,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CdnService } from './cdn.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { ServeAssetDto } from './dto/serve-asset.dto';
import { InvalidateCacheDto } from './dto/invalidate-cache.dto';

@Controller('cdn')
export class CdnController {
  constructor(private readonly cdnService: CdnService) {}

  /**
   * Upload new asset
   */
  @Post('assets')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAsset(
    @Body() createAssetDto: CreateAssetDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.cdnService.uploadAsset(createAssetDto, file.buffer);
  }

  /**
   * Get asset details
   */
  @Get('assets/:id')
  async getAsset(@Param('id') id: string) {
    return this.cdnService.getAssetInfo(id);
  }

  /**
   * Serve an asset with optimizations
   */
  @Get('serve/:id')
  async serveAsset(
    @Param('id') id: string,
    @Query('courseId') courseId: string,
    @Query('moduleId') moduleId: string,
    @Query('studentId') studentId: string,
    @Headers('user-agent') userAgent: string,
    @Headers('x-connection-type') connectionType: string,
    @Res() res: Response,
  ) {
    const result = await this.cdnService.serveAsset({
      assetId: id,
      courseId,
      moduleId,
      studentId,
      userAgent,
      connectionType,
      region: 'default', // Could be determined based on request IP
    });

    // Redirect to the optimized asset URL
    return res.redirect(result.url);
  }

  /**
   * Invalidate cache
   */
  @Post('cache/invalidate')
  async invalidateCache(@Body() invalidateDto: InvalidateCacheDto) {
    return this.cdnService.invalidateCache(invalidateDto);
  }

  /**
   * Get CDN metrics
   */
  @Get('metrics')
  async getMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('region') region?: string,
  ) {
    return this.cdnService.getCdnMetrics(
      new Date(startDate), 
      new Date(endDate),
      region,
    );
  }
}
