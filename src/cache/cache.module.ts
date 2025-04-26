// cache/cache.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global() // Makes this module global so you don't have to import it everywhere
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}