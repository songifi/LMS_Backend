import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AssetEntity } from './entities/asset.entity';
import { EdgeCacheService } from './edge-cache.service';
import { MediaOptimizationService } from './media-optimization.service';
import { PreloadingService } from './preloading.service';
import { BandwidthDetectionService } from './bandwidth-detection.service';
import { MetricsService } from './metrics.service';
import { CdnConfig } from './interfaces/cdn-config.interface';
import { CreateAssetDto } from './dto/create-asset.dto';
import { ServeAssetDto } from './dto/serve-asset.dto';
import { InvalidateCacheDto } from './dto/invalidate-cache.dto';

@Injectable()
export class CdnService {
  constructor(
    @Inject('CDN_CONFIG')
    private readonly config: CdnConfig,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    private readonly edgeCacheService: EdgeCacheService,
    private readonly mediaOptimizationService: MediaOptimizationService,
    private readonly preloadingService: PreloadingService,
    private readonly bandwidthDetectionService: BandwidthDetectionService,
    private readonly metricsService: MetricsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Upload and process a new asset
   */
  async uploadAsset(createAssetDto: CreateAssetDto, file: Buffer): Promise<AssetEntity> {
    // Store the original asset
    const asset = this.assetRepository.create({
      originalKey: createAssetDto.key,
      mimeType: createAssetDto.mimeType,
      size: file.length,
      courseId: createAssetDto.courseId,
      moduleId: createAssetDto.moduleId,
      tags: createAssetDto.tags,
      isPublic: createAssetDto.isPublic,
      metadata: createAssetDto.metadata || {},
      optimizedVersions: [],
    });

    // Extract dimensions if media file
    if (createAssetDto.mimeType.startsWith('image/')) {
      const dimensions = await this.mediaOptimizationService.getImageDimensions(file);
      asset.width = dimensions.width;
      asset.height = dimensions.height;
    } else if (createAssetDto.mimeType.startsWith('video/')) {
      const metadata = await this.mediaOptimizationService.getVideoMetadata(file);
      asset.width = metadata.width;
      asset.height = metadata.height;
      asset.duration = metadata.duration;
    }

    // Save the original asset first
    const savedAsset = await this.assetRepository.save(asset);

    // Queue media optimization
    await this.mediaOptimizationService.optimizeAsset(savedAsset, file);

    // Trigger preloading for related content
    this.preloadingService.analyzeAndPreload(savedAsset.courseId, savedAsset.moduleId);

    return savedAsset;
  }

  /**
   * Serve an asset to a student with optimal format and caching
   */
  async serveAsset(serveAssetDto: ServeAssetDto): Promise<{
    url: string;
    cacheHit: boolean;
    optimized: boolean;
  }> {
    const startTime = Date.now();
    
    // Check if the asset is in edge cache
    const cachedAsset = await this.edgeCacheService.getFromCache(
      serveAssetDto.assetId,
      serveAssetDto.region,
    );

    if (cachedAsset) {
      // Record metrics
      this.metricsService.recordMetric({
        assetId: serveAssetDto.assetId,
        studentId: serveAssetDto.studentId,
        edgeNodeId: cachedAsset.edgeNodeId,
        region: serveAssetDto.region,
        metricType: 'cache_hit',
        value: 1,
        additionalData: {
          latency: Date.now() - startTime,
        },
      });

      // Update student preferences for future preloading
      if (serveAssetDto.studentId) {
        await this.preloadingService.updateStudentAccessPattern(
          serveAssetDto.studentId,
          serveAssetDto.assetId,
          serveAssetDto.courseId,
          serveAssetDto.moduleId,
        );
      }

      return {
        url: cachedAsset.url,
        cacheHit: true,
        optimized: true,
      };
    }

    // Cache miss, need to fetch and possibly optimize the asset
    const asset = await this.assetRepository.findOne({ where: { id: serveAssetDto.assetId } });
    if (!asset) {
      throw new Error('Asset not found');
    }

    // Detect client bandwidth and capabilities
    const clientCapabilities = await this.bandwidthDetectionService.detectClientCapabilities(
      serveAssetDto.userAgent,
      serveAssetDto.connectionType,
      serveAssetDto.studentId,
    );

    // Select the best version for the client
    const bestVersion = await this.mediaOptimizationService.selectBestVersion(
      asset,
      clientCapabilities,
    );

    // Store in edge cache for future requests
    const cacheResult = await this.edgeCacheService.storeInCache(
      serveAssetDto.assetId,
      bestVersion.key,
      serveAssetDto.region,
    );

    // Record metrics
    this.metricsService.recordMetric({
      assetId: serveAssetDto.assetId,
      studentId: serveAssetDto.studentId,
      edgeNodeId: cacheResult.edgeNodeId,
      region: serveAssetDto.region,
      metricType: 'cache_miss',
      value: 1,
      additionalData: {
        latency: Date.now() - startTime,
        optimized: Boolean(bestVersion !== asset.originalKey),
      },
    });

    // Update student preferences for future preloading
    if (serveAssetDto.studentId) {
      await this.preloadingService.updateStudentAccessPattern(
        serveAssetDto.studentId,
        serveAssetDto.assetId,
        serveAssetDto.courseId,
        serveAssetDto.moduleId,
      );
    }

    return {
      url: cacheResult.url,
      cacheHit: false,
      optimized: Boolean(bestVersion !== asset.originalKey),
    };
  }

  /**
   * Invalidate cache entries for specific assets or patterns
   */
  async invalidateCache(invalidateDto: InvalidateCacheDto): Promise<{ 
    invalidatedCount: number 
  }> {
    const result = await this.edgeCacheService.invalidateCache(
      invalidateDto.pattern,
      invalidateDto.region,
    );

    return { invalidatedCount: result.count };
  }

  /**
   * Get asset information including optimization status
   */
  async getAssetInfo(assetId: string): Promise<AssetEntity> {
    return this.assetRepository.findOne({ where: { id: assetId } });
  }

  /**
   * Get CDN performance metrics and statistics
   */
  async getCdnMetrics(startDate: Date, endDate: Date, region?: string): Promise<any> {
    return this.metricsService.getAggregatedMetrics(startDate, endDate, region);
  }
}
