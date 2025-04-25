import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { Content } from './entities/content.entity';
import { ContentModule as ContentModuleEntity } from './entities/content-module.entity';
import { ContentVersion } from './entities/content-version.entity';
import { ContentAccess } from './entities/content-access.entity';
import { ContentMetadata } from './entities/content-metadata.entity';
import { ContentController } from './controllers/content.controller';
import { UsersModule } from 'src/user/user.module';
import { ContentModuleController } from './controllers/content-module.controller';
import { ContentService } from './providers/content.service';
import { ContentModuleService } from './providers/content-module.service';
import { FileUploadService } from './providers/file-upload.service';
import { ContentAnalyticsService } from './providers/content-analytics.service';
import { ContentSearchService } from './providers/content-search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Content,
      ContentModuleEntity,
      ContentVersion,
      ContentAccess,
      ContentMetadata,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/content',
        filename: (req, file, cb) => {
          const randomName = uuid();
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
    UsersModule,
  ],
  controllers: [ContentController, ContentModuleController],
  providers: [
    ContentService,
    ContentModuleService,
    FileUploadService,
    ContentAnalyticsService,
    ContentSearchService,
  ],
  exports: [ContentService, ContentModuleService],
})
export class ContentModule {}