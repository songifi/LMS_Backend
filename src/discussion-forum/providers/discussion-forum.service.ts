import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { Forum } from '../entities/discussion-forum.entity';
import { CourseManagementService } from 'src/course-management/course-management.service';
import { User } from 'src/user/entities/user.entity';
import { CreateForumDto } from '../dto/create-discussion-forum.dto';
import { UpdateForumDto } from '../dto/update-discussion-forum.dto';
import { RoleEnum } from '../../user/role.enum';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(Forum)
    private forumRepository: Repository<Forum>,
    private courseService: CourseManagementService,
  ) {}

  async findAll(courseId?: string, user?: User) {
    const queryBuilder = this.forumRepository
      .createQueryBuilder('forum')
      .leftJoinAndSelect('forum.course', 'course')
      .where('forum.isActive = :isActive', { isActive: true });

    if (courseId) {
      queryBuilder.andWhere('course.id = :courseId', {
        courseId: parseInt(courseId, 10),
      });
    } else if (user && !user.roles?.some(role => role.name === RoleEnum.ADMIN)) {
      const userCourseIds = await this.getUserCoursesStub(user.id);

      queryBuilder.andWhere(
        '(forum.isGlobal = :isGlobal OR course.id IN (:...userCourseIds))',
        {
          isGlobal: true,
          userCourseIds: userCourseIds.length ? userCourseIds : [0],
        },
      );
    }

    return queryBuilder.getMany();
  }

  private async getUserCoursesStub(userId: number): Promise<number[]> {
    console.warn('getUserCoursesStub called - implement CourseManagementService');
    return [];
  }

  async create(createForumDto: CreateForumDto, user: User) {
    const forum = new Forum();
    forum.title = createForumDto.title;
    forum.description = createForumDto.description;
    forum.isGlobal = createForumDto.isGlobal || false;
    forum.createdBy = user;

    if (!forum.isGlobal && createForumDto.courseId) {
      const courseId = parseInt(createForumDto.courseId, 10);
      forum.course = { id: courseId } as any;
    }

    return this.forumRepository.save(forum);
  }

  async findOne(id: string, user: User) {
    const forum = await this.forumRepository.findOne({
      where: { id: id },
      relations: ['course'],
    } as FindOneOptions<Forum>); // FIXED

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (!forum.isGlobal && forum.course) {
      const hasAccess = await this.checkUserCourseAccessStub(user.id, forum.course.id);
      if (!hasAccess && !user.roles?.some(role => role.name === RoleEnum.ADMIN)) {
        throw new ForbiddenException('You do not have access to this forum');
      }
    }

    return forum;
  }

  private async checkUserCourseAccessStub(userId: number, courseId: number): Promise<boolean> {
    console.warn('checkUserCourseAccessStub called - implement CourseManagementService');
    return true;
  }

  async update(id: string, updateForumDto: UpdateForumDto, user: User) {
    const forum = await this.findOne(id, user);

    const isAdmin = user.roles?.some(role => role.name === RoleEnum.ADMIN);
    const isInstructor = user.roles?.some(role => role.name === RoleEnum.INSTRUCTOR);

    if (
      !isAdmin &&
      (!isInstructor || forum.createdBy.id !== user.id)
    ) {
      throw new ForbiddenException('You do not have permission to update this forum');
    }

    Object.assign(forum, updateForumDto);
    return this.forumRepository.save(forum);
  }

  async remove(id: string) {
    const forum = await this.forumRepository.findOne({
      where: { id: id },
    } as FindOneOptions<Forum>); // FIXED

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return this.forumRepository.remove(forum);
  }

  async getTopics(id: string, user: User) {
    await this.findOne(id, user);

    return this.forumRepository
      .createQueryBuilder('forum')
      .leftJoinAndSelect('forum.topics', 'topic')
      .leftJoinAndSelect('topic.createdBy', 'user')
      .where('forum.id = :id', { id })
      .orderBy('topic.isPinned', 'DESC')
      .addOrderBy('topic.updatedAt', 'DESC')
      .getOne();
  }
}
