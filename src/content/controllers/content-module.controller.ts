import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    ForbiddenException,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
  import { CreateContentModuleDto } from '../dto/create-content-module.dto';
  import { UpdateContentModuleDto } from '../dto/update-content-module.dto';
import { ContentModuleService } from '../providers/content-module.service';
  
  @Controller('content/modules')
  export class ContentModuleController {
    constructor(private readonly moduleService: ContentModuleService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createModuleDto: CreateContentModuleDto, @Req() req) {
      return this.moduleService.create(createModuleDto, req.user.id);
    }
  
    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(@Req() req) {
      return this.moduleService.findAll(req.user);
    }
  
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
      return this.moduleService.findOne(id);
    }
  
    @Get(':id/contents')
    @UseGuards(JwtAuthGuard)
    getModuleContents(@Param('id') id: string, @Req() req) {
      return this.moduleService.getModuleContents(id, req.user);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(
      @Param('id') id: string,
      @Body() updateModuleDto: UpdateContentModuleDto,
      @Req() req,
    ) {
      const module = await this.moduleService.findOne(id);
      if (module.creator.id !== req.user.id && !req.user.isAdmin) {
        throw new ForbiddenException('You do not have permission to update this module');
      }
      
      return this.moduleService.update(id, updateModuleDto);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string, @Req() req) {
      const module = await this.moduleService.findOne(id);
      if (module.creator.id !== req.user.id && !req.user.isAdmin) {
        throw new ForbiddenException('You do not have permission to delete this module');
      }
      
      return this.moduleService.remove(id);
    }
  }