import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WebAppService } from './web-app.service';
import { CreateWebAppDto } from './dto/create-web-app.dto';
import { UpdateWebAppDto } from './dto/update-web-app.dto';

@Controller('web-app')
export class WebAppController {
  constructor(private readonly webAppService: WebAppService) {}

  @Post()
  create(@Body() createWebAppDto: CreateWebAppDto) {
    return this.webAppService.create(createWebAppDto);
  }

  @Get()
  findAll() {
    return this.webAppService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.webAppService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWebAppDto: UpdateWebAppDto) {
    return this.webAppService.update(+id, updateWebAppDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.webAppService.remove(+id);
  }
}
