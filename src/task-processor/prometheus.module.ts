import { Module } from '@nestjs/common';
import { PrometheusModule as NestPrometheusModule } from 'nestjs-prometheus';
import { QueueMetricsService } from './providers/queue-metrics.service';
import { BullModule } from '@nestjs/bull';
import { TaskProcessorModule } from '../task-processor.module';

@Module({
  imports: [
    NestPrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
    BullModule.registerQueue(
      { name: TaskProcessorModule.QUEUE_NAMES.GRADING },
      { name: TaskProcessorModule.QUEUE_NAMES.REPORT },
      { name: TaskProcessorModule.QUEUE_NAMES.MEDIA },
      { name: TaskProcessorModule.QUEUE_NAMES.DEAD_LETTER },
    ),
  ],
  providers: [QueueMetricsService],
})
export class PrometheusModule {}
