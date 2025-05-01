import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CreateContentBlockDto } from '../dto/create-content-block.dto';
import { ContentBlockService } from '../providers/content-block.service';

@Controller('content-blocks')
export class ContentBlockController {
  constructor(private readonly contentBlockService: ContentBlockService) {}

  @Post()
  create(@Body() createDto: CreateContentBlockDto) {
    return this.contentBlockService.create(createDto);
  }

  @Get('template/:templateId')
  findByTemplateId(@Param('templateId', ParseUUIDPipe) templateId: string) {
    return this.contentBlockService.findByTemplateId(templateId);
  }

  @Get('reusable')
  findReusableBlocks() {
    return this.contentBlockService.findReusableBlocks();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contentBlockService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: Partial<CreateContentBlockDto>,
  ) {
    return this.contentBlockService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contentBlockService.remove(id);
  }
}
