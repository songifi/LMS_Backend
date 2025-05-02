import { Module } from '@nestjs/common';
import { WebAppService } from './web-app.service';
import { WebAppController } from './web-app.controller';

@Module({
  controllers: [WebAppController],
  providers: [WebAppService],
})
export class WebAppModule {}
