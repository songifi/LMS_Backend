import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager, FindManyOptions } from 'typeorm';
import { ForumSubscription } from '../entities/forum-subscription.entity';
import { Topic } from '../entities/topic.entity';
import { Post } from '../entities/post.entity';
import { UsersService } from 'src/user/providers/user.service';
import { RoleEnum } from 'src/user/role.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(ForumSubscription)
    private subscriptionRepository: Repository<ForumSubscription>,
    private userService: UsersService,
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  private async createNotification(data: {
    userIds: number[];
    title: string;
    content: string;
    link: string;
    category: string;
    metadata?: Record<string, any>;
    priority?: 'low' | 'normal' | 'high';
  }) {
    const notifications = data.userIds.map((userId) => {
      const notification = this.entityManager.create(Notification, {
        user: { id: userId },
        title: data.title,
        content: data.content,
        link: data.link,
        category: data.category,
        metadata: data.metadata || {},
        priority: data.priority || 'normal',
      });
      return notification;
    });

    await this.entityManager.save(Notification, notifications);
  }

  async notifyNewTopic(topic: Topic) {
    const forumSubscribers = await this.subscriptionRepository.find({
      where: { forum: { id: topic.forum.id }, isActive: true },
      relations: ['user'],
    } as FindManyOptions<ForumSubscription>);

    if (forumSubscribers.length > 0) {
      const userIds = forumSubscribers.map(sub => sub.user.id);

      await this.createNotification({
        userIds,
        title: 'New Topic in Forum',
        content: `A new topic "${topic.title}" has been created in the forum "${topic.forum.title}"`,
        link: `/forums/${topic.forum.id}/topics/${topic.id}`,
        category: 'forum',
        metadata: {
          forumId: topic.forum.id,
          topicId: topic.id,
        },
      });
    }
  }

  async notifyNewPost(post: Post) {
    const topicSubscribers = await this.subscriptionRepository.find({
      where: { topic: { id: post.topic.id }, isActive: true },
      relations: ['user'],
    } as FindManyOptions<ForumSubscription>);

    const userIds = topicSubscribers
      .filter(sub => sub.user.id !== post.createdBy.id)
      .map(sub => sub.user.id);

    if (userIds.length > 0) {
      await this.createNotification({
        userIds,
        title: 'New Reply in Topic',
        content: `There's a new reply in the topic "${post.topic.title}"`,
        link: `/forums/topics/${post.topic.id}?highlight=${post.id}`,
        category: 'forum',
        metadata: {
          topicId: post.topic.id,
          postId: post.id,
        },
      });
    }

    if (post.replyTo && post.replyTo.createdBy.id !== post.createdBy.id) {
      await this.createNotification({
        userIds: [post.replyTo.createdBy.id],
        title: 'Reply to Your Post',
        content: `Someone replied to your post in "${post.topic.title}"`,
        link: `/forums/topics/${post.topic.id}?highlight=${post.id}`,
        category: 'forum',
        metadata: {
          topicId: post.topic.id,
          postId: post.id,
          replyToId: post.replyTo.id,
        },
      });
    }
  }

  async notifyPostReport(post: Post, reason: string) {
    const moderators = await this.userService.findUsersByRoles([
      RoleEnum.MODERATOR,
      RoleEnum.INSTRUCTOR,
      RoleEnum.ADMIN,
    ]);

    if (moderators.length > 0) {
      const userIds = moderators.map(user => user.id);

      await this.createNotification({
        userIds,
        title: 'Post Reported',
        content: `A post in "${post.topic.title}" has been reported. Reason: ${reason}`,
        link: `/forums/moderation/reported/${post.id}`,
        category: 'moderation',
        priority: 'high',
        metadata: {
          topicId: post.topic.id,
          postId: post.id,
          reason,
        },
      });
    }
  }
}
