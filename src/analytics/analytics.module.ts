import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsDatapoint } from './entities/analytics-datapoint.entity';
import { AnalyticsMetric } from './entities/analytics.entity';
import { AnalyticsService } from './providers/analytics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsMetric,
      AnalyticsDatapoint,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}