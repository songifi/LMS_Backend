import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DatabaseMigrationService } from './database-migration.service';
import { CreateDatabaseMigrationDto } from './dto/create-database-migration.dto';
import { UpdateDatabaseMigrationDto } from './dto/update-database-migration.dto';

@Controller('database-migration')
export class DatabaseMigrationController {
  constructor(private readonly databaseMigrationService: DatabaseMigrationService) {}

  @Post()
  create(@Body() createDatabaseMigrationDto: CreateDatabaseMigrationDto) {
    return this.databaseMigrationService.create(createDatabaseMigrationDto);
  }

  @Get()
  findAll() {
    return this.databaseMigrationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.databaseMigrationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDatabaseMigrationDto: UpdateDatabaseMigrationDto) {
    return this.databaseMigrationService.update(+id, updateDatabaseMigrationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.databaseMigrationService.remove(+id);
  }
}
