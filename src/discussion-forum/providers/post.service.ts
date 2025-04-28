import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { TopicService } from './topic.service';
import { ForumAttachment } from '../entities/forum-attachment.entity';
import { NotificationService } from './notification.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(ForumAttachment)
    private attachmentRepository: Repository<ForumAttachment>,
    private topicService: TopicService,
    private notificationService: NotificationService,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    files: Array<Express.Multer.File>,
    user: User,
  ) {
    const topic = await this.topicService.findOne(createPostDto.topicId, user);

    if (topic.isLocked) {
      throw new BadRequestException('This topic is locked and cannot receive new posts');
    }

    const post = new Post();
    post.content = createPostDto.content;
    post.topic = topic;
    post.createdBy = user;

    if (createPostDto.replyToId) {
      const replyTo = await this.postRepository.findOne({
        where: { id: createPostDto.replyToId },
      });
      if (!replyTo) {
        throw new NotFoundException('Reply post not found');
      }
      post.replyTo = replyTo;
    }

    const savedPost = await this.postRepository.save(post);

    // Save attachments if any
    if (files && files.length > 0) {
      const attachments = files.map(file => {
        const attachment = new ForumAttachment();
        attachment.fileName = file.filename;
        attachment.originalName = file.originalname;
        attachment.mimeType = file.mimetype;
        attachment.size = file.size;
        attachment.path = file.path;
        attachment.post = savedPost;
        return attachment;
      });

      await this.attachmentRepository.save(attachments);
    }

    // Notify subscribers
    await this.notificationService.notifyNewPost(savedPost);

    return this.postRepository.findOne({
      where: { id: savedPost.id },
      relations: ['attachments', 'createdBy', 'replyTo'],
    });
  }

  async findOne(id: string, user: User) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['topic', 'topic.forum', 'createdBy', 'attachments', 'replyTo'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check access rights through topic
    await this.topicService.findOne(post.topic.id, user);

    return post;
  }

  async reportPost(id: string, reason: string, user: User) {
    const post = await this.findOne(id, user);

    if (post.isReported) {
      throw new BadRequestException('This post has already been reported');
    }

    post.isReported = true;
    post.reportReason = reason;
    
    const savedPost = await this.postRepository.save(post);

    // Notify moderators
    await this.notificationService.notifyPostReport(savedPost, reason);

    return savedPost;
  }

  async moderatePost(id: string, action: 'approve' | 'remove', user: User) {
    const post = await this.findOne(id, user);

    if (action === 'approve') {
      post.isReported = false;
      post.reportReason = null;
    } else if (action === 'remove') {
      post.isModerated = true;
    }

    return this.postRepository.save(post);
  }
}
