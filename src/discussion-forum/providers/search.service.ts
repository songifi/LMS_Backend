import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../entities/topic.entity';
import { Post } from '../entities/post.entity';
import { SearchForumDto } from '../dto/search-forum.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}

  async search(searchDto: SearchForumDto, user: User) {
    // Create base query for topics
    let topicQuery = this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.forum', 'forum')
      .leftJoinAndSelect('forum.course', 'course')
      .where('topic.title ILIKE :query', { query: `%${searchDto.query}%` })
      .andWhere('forum.isActive = :isActive', { isActive: true });
  
    // Create base query for posts
    let postQuery = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.topic', 'topic')
      .leftJoinAndSelect('topic.forum', 'forum')
      .leftJoinAndSelect('forum.course', 'course')
      .where('post.content ILIKE :query', { query: `%${searchDto.query}%` })
      .andWhere('forum.isActive = :isActive', { isActive: true })
      .andWhere('post.isModerated = :isModerated', { isModerated: false });
  
    // Add forum filter if provided
    if (searchDto.forumId) {
      topicQuery = topicQuery.andWhere('forum.id = :forumId', {
        forumId: searchDto.forumId,
      });
      postQuery = postQuery.andWhere('forum.id = :forumId', {
        forumId: searchDto.forumId,
      });
    }
  
    // Add course filter if provided
    if (searchDto.courseId) {
      topicQuery = topicQuery.andWhere('course.id = :courseId', {
        courseId: searchDto.courseId,
      });
      postQuery = postQuery.andWhere('course.id = :courseId', {
        courseId: searchDto.courseId,
      });
    }
  
    // Execute queries
    const topics = await topicQuery
      .select(['topic.id', 'topic.title', 'forum.id', 'forum.title', 'course.id', 'course.title'])
      .addSelect('ts_rank(to_tsvector(topic.title), plainto_tsquery(:query))', 'rank')
      .orderBy('rank', 'DESC')
      .limit(20)
      .getRawAndEntities();
  
    const posts = await postQuery
      .select(['post.id', 'post.content', 'topic.id', 'topic.title', 'forum.id', 'forum.title'])
      .addSelect('ts_rank(to_tsvector(post.content), plainto_tsquery(:query))', 'rank')
      .orderBy('rank', 'DESC')
      .limit(20)
      .getRawAndEntities();
  
    return {
      topics: topics.entities,
      posts: posts.entities,
    };
  }
}