import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Put } from '@nestjs/common';
import { CreateTopicDto } from '../dto/create-topic.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { TopicService } from '../providers/topic.service';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RoleEnum } from 'src/user/role.enum';

@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  async create(@Body() createTopicDto: CreateTopicDto, @Request() req) {
    return this.topicService.create(createTopicDto, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.topicService.findOne(id, req.user);
  }

  @Get(':id/posts')
  async getPosts(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Request() req,
  ) {
    return this.topicService.getPosts(id, { page, limit }, req.user);
  }
  
  @Put(':id/pin')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.INSTRUCTOR, RoleEnum.MODERATOR)
  async pinTopic(@Param('id') id: string) {
    return this.topicService.pinTopic(id);
  }

  @Put(':id/lock')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.INSTRUCTOR, RoleEnum.MODERATOR)
  async lockTopic(@Param('id') id: string) {
    return this.topicService.lockTopic(id);
  }

  @Post(':id/subscribe')
  async subscribe(@Param('id') id: string, @Request() req) {
    return this.topicService.subscribe(id, req.user);
  }
}
