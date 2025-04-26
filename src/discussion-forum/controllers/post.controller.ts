import { Controller, Get, Post, Body, Param, UseGuards, Request, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PostService } from '../providers/post.service';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RoleEnum } from 'src/user/role.enum';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('attachments', 5, {
      storage: diskStorage({
        destination: './uploads/forum-attachments',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip)$/)) {
          return cb(new Error('Only specific file types are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Request() req,
  ) {
    return this.postService.create(createPostDto, files, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.postService.findOne(id, req.user);
  }

  @Put(':id/report')
  async reportPost(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.postService.reportPost(id, reason, req.user);
  }

  @Put(':id/moderate')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.INSTRUCTOR, RoleEnum.MODERATOR)
  async moderatePost(
    @Param('id') id: string,
    @Body('action') action: 'approve' | 'remove',
    @Request() req,
  ) {
    return this.postService.moderatePost(id, action, req.user);
  }
}