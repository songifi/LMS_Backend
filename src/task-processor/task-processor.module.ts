import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskProcessorService } from './task-processor.service';
import { TaskController } from './task.controller';
import { TaskEntity } from './entities/task.entity';
import { TaskResultEntity } from './entities/task-result.entity';
import { GradingProcessor } from './processors/grading.processor';
import { ReportProcessor } from './processors/report.processor';
import { MediaProcessor } from './processors/media.processor';
import { BullBoardModule } from './bull-board/bull-board.module';
import { PrometheusModule } from './prometheus/prometheus.module';

const QUEUE_NAMES = {
  GRADING: 'grading-queue',
  REPORT: 'report-queue',
  MEDIA: 'media-queue',
  DEAD_LETTER: 'dead-letter-queue'
};

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([TaskEntity, TaskResultEntity]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD', ''),
          db: configService.get('REDIS_DB', 0),
        },
        // Optional: These settings help with handling Redis connection failures
        settings: {
          retryStrategy: (times: number) => {
            // Exponential backoff for Redis reconnection
            return Math.min(times * 50, 2000);
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: QUEUE_NAMES.GRADING,
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: false,
          removeOnFail: false,
        },
      },
      {
        name: QUEUE_NAMES.REPORT,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: false,
          removeOnFail: false,
        },
      },
      {
        name: QUEUE_NAMES.MEDIA,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: false,
          removeOnFail: false,
        },
      },
      {
        name: QUEUE_NAMES.DEAD_LETTER,
        defaultJobOptions: {
          attempts: 1,
          removeOnComplete: false,
          removeOnFail: false,
        },
      }
    ),
    BullBoardModule,
    PrometheusModule,
  ],
  controllers: [TaskController],
  providers: [
    TaskProcessorService,
    GradingProcessor,
    ReportProcessor,
    MediaProcessor,
  ],
  exports: [TaskProcessorService, BullModule],
})
export class TaskProcessorModule {
  // Export the queue names for use in other modules
  static QUEUE_NAMES = QUEUE_NAMES;
}