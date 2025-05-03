import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('privacy/data-inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DataInventoryController {
  constructor(private readonly dataInventoryService: DataInventoryService) {}

  @Post()
  @Roles('admin', 'data-officer')
  create(@Body() dto: CreateDataInventoryDto) {
    return this.dataInventoryService.createDataInventory(dto);
  }

  @Get()
  @Roles('admin', 'data-officer', 'auditor')
  findAll() {
    return this.dataInventoryService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'data-officer', 'auditor')
  findOne(@Param('id') id: string) {
    return this.dataInventoryService.findOne(id);
  }

  @Get('entity/:name')
  @Roles('admin', 'data-officer', 'auditor')
  findByEntityName(@Param('name') name: string) {
    return this.dataInventoryService.findByEntityName(name);
  }

  @Patch(':id')
  @Roles('admin', 'data-officer')
  update(@Param('id') id: string, @Body() dto: Partial<CreateDataInventoryDto>) {
    return this.dataInventoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.dataInventoryService.remove(id);
  }

  @Get(':entityName/personal-data-fields')
  @Roles('admin', 'data-officer', 'auditor')
  getPersonalDataFields(@Param('entityName') entityName: string) {
    return this.dataInventoryService.getPersonalDataFields(entityName);
  }

  @Get(':entityName/sensitive-data-fields')
  @Roles('admin', 'data-officer', 'auditor')
  getSensitiveDataFields(@Param('entityName') entityName: string) {
    return this.dataInventoryService.getSensitiveDataFields(entityName);
  }

  @Get('entities-with-personal-data')
  @Roles('admin', 'data-officer', 'auditor')
  getEntitiesWithPersonalData() {
    return this.dataInventoryService.getEntitiesWithPersonalData();
  }
}