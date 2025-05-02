import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CdnService } from './cdn.service';
import { MediaOptimizationService } from './media-optimization.service';
import { EdgeCacheService } from './edge-cache.service';
import { PreloadingService } from './preloading.service';
import { BandwidthDetectionService } from './bandwidth-detection.service';
import { MetricsService } from './metrics.service';
import { CdnController } from './cdn.controller';
import { AssetEntity } from './entities/asset.entity';
import { CacheEntity } from './entities/cache.entity';
import { StudentPreferenceEntity } from './entities/student-preference.entity';
import { MetricsEntity } from './entities/metrics.entity';
import { CdnConfig } from './interfaces/cdn-config.interface';

@Module({})
export class CdnModule {
  static register(config: CdnConfig): DynamicModule {
    return {
      module: CdnModule,
      imports: [
        TypeOrmModule.forFeature([
          AssetEntity,
          CacheEntity,
          StudentPreferenceEntity,
          MetricsEntity,
        ]),
        ScheduleModule.forRoot(),
        ConfigModule,
      ],
      controllers: [CdnController],
      providers: [
        {
          provide: 'CDN_CONFIG',
          useValue: config,
        },
        CdnService,
        MediaOptimizationService,
        EdgeCacheService,
        PreloadingService,
        BandwidthDetectionService,
        MetricsService,
      ],
      exports: [CdnService, MetricsService],
    };
  }
}
