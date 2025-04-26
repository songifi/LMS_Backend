import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../entities/topic.entity';
import { CreateTopicDto } from '../dto/create-topic.dto';
import { ForumSubscription } from '../entities/forum-subscription.entity';
import { ForumService } from './discussion-forum.service';
import { NotificationService } from './notification.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(ForumSubscription)
    private subscriptionRepository: Repository<ForumSubscription>,
    private forumService: ForumService,
    private notificationService: NotificationService,
  ) {}

  async create(createTopicDto: CreateTopicDto, user: User) {
    const forum = await this.forumService.findOne(createTopicDto.forumId, user);

    const topic = new Topic();
    topic.title = createTopicDto.title;
    topic.forum = forum;
    topic.createdBy = user;

    const savedTopic = await this.topicRepository.save(topic);

    // Notify forum subscribers
    this.notificationService.notifyNewTopic(savedTopic);

    return savedTopic;
  }

  async findOne(id: string, user: User) {
    const topic = await this.topicRepository.findOne({
      where: { id },
      relations: ['forum', 'forum.course', 'createdBy'],
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    // Check access rights through forum
    await this.forumService.findOne(topic.forum.id, user);

    // Increment view count
    topic.viewCount += 1;
    await this.topicRepository.save(topic);

    return topic;
  }

  async getPosts(id: string, pagination: { page: number; limit: number }, user: User) {
    const topic = await this.findOne(id, user);

    const skip = (pagination.page - 1) * pagination.limit;

    return this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.posts', 'post')
      .leftJoinAndSelect('post.createdBy', 'user')
      .leftJoinAndSelect('post.attachments', 'attachment')
      .leftJoinAndSelect('post.replyTo', 'replyTo')
      .where('topic.id = :id', { id })
      .andWhere('post.isModerated = :isModerated', { isModerated: false })
      .orderBy('post.createdAt', 'ASC')
      .skip(skip)
      .take(pagination.limit)
      .getOne();
  }

  async pinTopic(id: string) {
    const topic = await this.topicRepository.findOne({ where: { id } });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    topic.isPinned = !topic.isPinned;
    return this.topicRepository.save(topic);
  }

  async lockTopic(id: string) {
    const topic = await this.topicRepository.findOne({ where: { id } });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    topic.isLocked = !topic.isLocked;
    return this.topicRepository.save(topic);
  }

  async subscribe(id: string, user: User) {
    const topic = await this.topicRepository.findOne({ where: { id } });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    // Check if subscription already exists
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { user: { id: user.id }, topic: { id } },
    });

    if (existingSubscription) {
      // Toggle subscription status
      existingSubscription.isActive = !existingSubscription.isActive;
      return this.subscriptionRepository.save(existingSubscription);
    }

    // Create new subscription
    const subscription = new ForumSubscription();
    subscription.user = user;
    subscription.topic = topic;
    
    return this.subscriptionRepository.save(subscription);
  }
}
