import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ForumService } from '../providers/discussion-forum.service';
import { CreateForumDto } from '../dto/create-discussion-forum.dto';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UpdateForumDto } from '../dto/update-discussion-forum.dto';
import { RoleEnum } from '../../user/role.enum';

@Controller('forums')
@UseGuards(JwtAuthGuard)
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get()
  async findAll(@Query('courseId') courseId?: string, @Request() req?: any) {
    return this.forumService.findAll(courseId, req.user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.INSTRUCTOR)
  async create(@Body() createForumDto: CreateForumDto, @Request() req) {
    return this.forumService.create(createForumDto, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.forumService.findOne(id, req.user);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.INSTRUCTOR)
  async update(
    @Param('id') id: string,
    @Body() updateForumDto: UpdateForumDto,
    @Request() req,
  ) {
    return this.forumService.update(id, updateForumDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  async remove(@Param('id') id: string) {
    return this.forumService.remove(id);
  }

  @Get(':id/topics')
  async getTopics(@Param('id') id: string, @Request() req) {
    return this.forumService.getTopics(id, req.user);
  }
}
