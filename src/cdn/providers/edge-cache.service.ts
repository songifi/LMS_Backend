import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CacheEntity } from './entities/cache.entity';
import { CdnConfig } from './interfaces/cdn-config.interface';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class EdgeCacheService {
  constructor(
    @Inject('CDN_CONFIG')
    private readonly config: CdnConfig,
    @InjectRepository(CacheEntity)
    private readonly cacheRepository: Repository<CacheEntity>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get an asset from the edge cache
   */
  async getFromCache(assetId: string, region: string): Promise<{ 
    url: string; 
    edgeNodeId: string;
  } | null> {
    // Find the closest edge node for the region
    const edgeNode = this.findBestEdgeNode(region);
    if (!edgeNode) {
      return null;
    }

    // Try to find a non-expired cache entry
    const cacheEntry = await this.cacheRepository.findOne({
      where: {
        assetId,
        region,
        edgeNodeId: edgeNode.endpoint,
        expiresAt: LessThan(new Date()),
        isStale: false,
      },
    });

    if (!cacheEntry) {
      return null;
    }

    // Update hit count
    await this.cacheRepository.update(
      { id: cacheEntry.id },
      { hitCount: () => 'hit_count + 1' }
    );

    // Construct the URL to the cached asset
    const url = `${edgeNode.endpoint}/assets/${cacheEntry.key}`;
    
    return {
      url,
      edgeNodeId: edgeNode.endpoint,
    };
  }

  /**
   * Store an asset in edge cache
   */
  async storeInCache(assetId: string, key: string, region: string): Promise<{
    url: string;
    edgeNodeId: string;
  }> {
    const edgeNode = this.findBestEdgeNode(region);
    if (!edgeNode) {
      throw new Error(`No edge node available for region: ${region}`);
    }

    // Calculate expiration time based on TTL config
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.config.cache.ttl);

    // Create or update cache entry
    const cacheEntry = await this.cacheRepository.findOne({
      where: {
        assetId,
        edgeNodeId: edgeNode.endpoint,
        region,
      },
    });

    if (cacheEntry) {
      await this.cacheRepository.update(
        { id: cacheEntry.id },
        {
          key,
          expiresAt,
          isStale: false,
        }
      );
    } else {
      await this.cacheRepository.save({
        assetId,
        key,
        edgeNodeId: edgeNode.endpoint,
        region,
        expiresAt,
        hitCount: 0,
        isStale: false,
      });
    }

    // Return the URL for accessing the cached asset
    return {
      url: `${edgeNode.endpoint}/assets/${key}`,
      edgeNodeId: edgeNode.endpoint,
    };
  }

  /**
   * Invalidate cache entries based on pattern
   */
  async invalidateCache(pattern: string, region?: string): Promise<{ count: number }> {
    const queryBuilder = this.cacheRepository.createQueryBuilder('cache');
    
    queryBuilder.where('cache.key LIKE :pattern', { pattern: `%${pattern}%` });
    
    if (region) {
      queryBuilder.andWhere('cache.region = :region', { region });
    }
    
    const result = await queryBuilder
      .update()
      .set({ isStale: true })
      .execute();

    return { count: result.affected || 0 };
  }

  /**
   * Find the best edge node for a region
   */
  private findBestEdgeNode(region: string): EdgeNodeConfig {
    // Find edge nodes in the requested region
    const regionalNodes = this.config.edgeNodes.filter(node => node.region === region);
    
    if (regionalNodes.length === 0) {
      // Fallback to any available node
      return this.config.edgeNodes[0];
    }
    
    // For now, simple round-robin selection
    // In a real implementation, this would consider node load, health, etc.
    const randomIndex = Math.floor(Math.random() * regionalNodes.length);
    return regionalNodes[randomIndex];
  }

  /**
   * Scheduled job to clean up expired cache entries
   */
  @Cron('0 */1 * * *') // Run every hour
  async cleanupExpiredCache() {
    const result = await this.cacheRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    
    console.log(`Cleaned up ${result.affected} expired cache entries`);
  }
}
