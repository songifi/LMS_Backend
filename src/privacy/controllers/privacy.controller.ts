import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrivacyService } from './privacy.service';
import { CreatePrivacyDto } from './dto/create-privacy.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';

@Controller('privacy')
export class PrivacyController {
  constructor(private readonly privacyService: PrivacyService) {}

  @Post()
  create(@Body() createPrivacyDto: CreatePrivacyDto) {
    return this.privacyService.create(createPrivacyDto);
  }

  @Get()
  findAll() {
    return this.privacyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.privacyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrivacyDto: UpdatePrivacyDto) {
    return this.privacyService.update(+id, updatePrivacyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.privacyService.remove(+id);
  }
}
