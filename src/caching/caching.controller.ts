import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CachingService } from './services/caching.service';
import { CreateCachingDto } from './dto/create-caching.dto';
import { UpdateCachingDto } from './dto/update-caching.dto';

@Controller('caching')
export class CachingController {
  constructor(private readonly cachingService: CachingService) {}

  @Post()
  create(@Body() createCachingDto: CreateCachingDto) {
    return this.cachingService.create(createCachingDto);
  }

  @Get()
  findAll() {
    return this.cachingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cachingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCachingDto: UpdateCachingDto) {
    return this.cachingService.update(+id, updateCachingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cachingService.remove(+id);
  }
}
