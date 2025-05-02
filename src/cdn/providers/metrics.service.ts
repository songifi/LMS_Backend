import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MetricsEntity } from './entities/metrics.entity';
import { CdnConfig } from './interfaces/cdn-config.interface';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MetricsService {
  constructor(
    @Inject('CDN_CONFIG')
    private readonly config: CdnConfig,
    @InjectRepository(MetricsEntity)
    private readonly metricsRepository: Repository<MetricsEntity>,
  ) {}

  /**
   * Record a metric
   */
  async recordMetric(metric: {
    assetId?: string;
    studentId?: string;
    edgeNodeId?: string;
    region?: string;
    metricType: 'latency' | 'error' | 'cache_hit' | 'cache_miss' | 'bandwidth' | 'load_time';
    value: number;
    additionalData?: Record<string, any>;
  }): Promise<void> {
    // Skip if metrics are disabled
    if (!this.config.metrics.enabled) {
      return;
    }
    
    // Sample data to reduce database load
    if (Math.random() > this.config.metrics.sampleRate) {
      return;
    }
    
    const metricsData = this.metricsRepository.create({
      timestamp: new Date(),
      assetId: metric.assetId,
      studentId: metric.studentId,
      edgeNodeId: metric.edgeNodeId,
      region: metric.region,
      metricType: metric.metricType,
      value: metric.value,
      additionalData: metric.additionalData || {},
    });
    
    await this.metricsRepository.save(metricsData);
    
    // Check alert thresholds
    this.checkAlertThresholds(metric);
  }

  /**
   * Get aggregated metrics
   */
  async getAggregatedMetrics(
    startDate: Date,
    endDate: Date,
    region?: string,
  ): Promise<any> {
    // Base query conditions
    const where: any = {
      timestamp: Between(startDate, endDate),
    };
    
    if (region) {
      where.region = region;
    }
    
    // Get metrics
    const metrics = await this.metricsRepository.find({ where });
    
    // Aggregate metrics
    const result = {
      cacheHitRatio: this.calculateCacheHitRatio(metrics),
      averageLatency: this.calculateAverageLatency(metrics),
      errorRate: this.calculateErrorRate(metrics),
      bandwidthUsage: this.calculateBandwidthUsage(metrics),
      totalRequests: metrics.length,
      regionBreakdown: this.calculateRegionBreakdown(metrics),
      topAssets: this.calculateTopAssets(metrics),
    };
    
    return result;
  }

  /**
   * Calculate cache hit ratio
   */
  private calculateCacheHitRatio(metrics: MetricsEntity[]): number {
    const cacheHits = metrics.filter(m => m.metricType === 'cache_hit').length;
    const cacheMisses = metrics.filter(m => m.metricType === 'cache_miss').length;
    
    if (cacheHits + cacheMisses === 0) {
      return 0;
    }
    
    return cacheHits / (cacheHits + cacheMisses);
  }

  /**
   * Calculate average latency
   */
  private calculateAverageLatency(metrics: MetricsEntity[]): number {
    const latencyMetrics = metrics.filter(m => m.metricType === 'latency');
    
    if (latencyMetrics.length === 0) {
      return 0;
    }
    
    const sum = latencyMetrics.reduce((total, metric) => total + metric.value, 0);
    return sum / latencyMetrics.length;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(metrics: MetricsEntity[]): number {
    const errors = metrics.filter(m => m.metricType === 'error').length;
    
    if (metrics.length === 0) {
      return 0;
    }
    
    return errors / metrics.length;
  }

  /**
   * Calculate bandwidth usage
   */
  private calculateBandwidthUsage(metrics: MetricsEntity[]): number {
    const bandwidthMetrics = metrics.filter(m => m.metricType === 'bandwidth');
    
    if (bandwidthMetrics.length === 0) {
      return 0;
    }
    
    return bandwidthMetrics.reduce((total, metric) => total + metric.value, 0);
  }

  /**
   * Calculate region breakdown
   */
  private calculateRegionBreakdown(metrics: MetricsEntity[]): Record<string, number> {
    const regions: Record<string, number> = {};
    
    metrics.forEach(metric => {
      if (metric.region) {
        regions[metric.region] = (regions[metric.region] || 0) + 1;
      }
    });
    
    return regions;
  }

  /**
   * Calculate top assets
   */
  private calculateTopAssets(metrics: MetricsEntity[]): { assetId: string; count: number }[] {
    const assetCounts: Record<string, number> = {};
    
    metrics.forEach(metric => {
      if (metric.assetId) {
        assetCounts[metric.assetId] = (assetCounts[metric.assetId] || 0) + 1;
      }
    });
    
    return Object.entries(assetCounts)
      .map(([assetId, count]) => ({ assetId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Check alert thresholds
   */
  private checkAlertThresholds(metric: {
    metricType: string;
    value: number;
  }): void {
    // Skip if alerts are not configured
    if (!this.config.metrics.alertThresholds) {
      return;
    }
    
    const thresholds = this.config.metrics.alertThresholds;
    
    // Check latency threshold
    if (metric.metricType === 'latency' && 
        thresholds.latency && 
        metric.value > thresholds.latency) {
      console.warn(`ALERT: Latency threshold exceeded: ${metric.value}ms > ${thresholds.latency}ms`);
      // In a real implementation, this would trigger an alert via a notification service
    }
    
    // Check error rate threshold
    if (metric.metricType === 'error' && 
        thresholds.errorRate && 
        metric.value > thresholds.errorRate) {
      console.warn(`ALERT: Error rate threshold exceeded: ${metric.value} > ${thresholds.errorRate}`);
      // In a real implementation, this would trigger an alert
    }
  }

  /**
   * Clean up old metrics data
   */
  @Cron('0 0 * * *') // Run daily at midnight
  async cleanupOldMetrics(): Promise<void> {
    // Skip if retention is not configured
    if (!this.config.metrics.retentionDays) {
      return;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.metrics.retentionDays);
    
    const result = await this.metricsRepository.delete({
      timestamp: LessThan(cutoffDate),
    });
    
    console.log(`Cleaned up ${result.affected} old metric records`);
  }
}
