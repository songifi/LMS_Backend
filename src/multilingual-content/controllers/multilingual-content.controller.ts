import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MultilingualContentService } from './multilingual-content.service';
import { CreateMultilingualContentDto } from './dto/create-multilingual-content.dto';
import { UpdateMultilingualContentDto } from './dto/update-multilingual-content.dto';

@Controller('multilingual-content')
export class MultilingualContentController {
  constructor(private readonly multilingualContentService: MultilingualContentService) {}

  @Post()
  create(@Body() createMultilingualContentDto: CreateMultilingualContentDto) {
    return this.multilingualContentService.create(createMultilingualContentDto);
  }

  @Get()
  findAll() {
    return this.multilingualContentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.multilingualContentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMultilingualContentDto: UpdateMultilingualContentDto) {
    return this.multilingualContentService.update(+id, updateMultilingualContentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.multilingualContentService.remove(+id);
  }
}
