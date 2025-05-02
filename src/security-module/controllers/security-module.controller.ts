import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SecurityModuleService } from './security-module.service';
import { CreateSecurityModuleDto } from '../dto/create-security-module.dto';
import { UpdateSecurityModuleDto } from '../dto/update-security-module.dto';

@Controller('security-module')
export class SecurityModuleController {
  constructor(private readonly securityModuleService: SecurityModuleService) {}

  @Post()
  create(@Body() createSecurityModuleDto: CreateSecurityModuleDto) {
    return this.securityModuleService.create(createSecurityModuleDto);
  }

  @Get()
  findAll() {
    return this.securityModuleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.securityModuleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSecurityModuleDto: UpdateSecurityModuleDto) {
    return this.securityModuleService.update(+id, updateSecurityModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.securityModuleService.remove(+id);
  }
}
