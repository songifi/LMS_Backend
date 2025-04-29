import { Module } from '@nestjs/common';
import { FeedbackService } from './providers/feedback.service';
import { FeedbackController } from './controllers/feedback.controller';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
