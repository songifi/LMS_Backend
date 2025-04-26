import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicController } from './controllers/topic.controller';
import { PostController } from './controllers/post.controller';
import { SearchController } from './controllers/search.controller';
import { Topic } from './entities/topic.entity';
import { Post } from './entities/post.entity';
import { ForumAttachment } from './entities/forum-attachment.entity';
import { ForumSubscription } from './entities/forum-subscription.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { Forum } from './entities/discussion-forum.entity';
import { CourseManagementModule } from 'src/course-management/course-management.module';
import { UsersModule } from 'src/user/user.module';
import { ForumController } from './controllers/discussion-forum.controller';
import { ForumService } from './providers/discussion-forum.service';
import { TopicService } from './providers/topic.service';
import { PostService } from './providers/post.service';
import { SearchService } from './providers/search.service';
import { NotificationService } from './providers/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Forum,
      Topic,
      Post,
      ForumAttachment,
      ForumSubscription,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads/forum-attachments');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
    CourseManagementModule,
    // NotificationsModule,
    UsersModule,
  ],
  controllers: [
    ForumController,
    TopicController,
    PostController,
    SearchController,
  ],
  providers: [
    ForumService,
    TopicService,
    PostService,
    SearchService,
    NotificationService,
  ],
  exports: [
    ForumService,
    TopicService,
    PostService,
  ],
})
export class ForumModule {}