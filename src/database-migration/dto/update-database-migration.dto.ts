import { PartialType } from '@nestjs/swagger';
import { CreateDatabaseMigrationDto } from './create-database-migration.dto';

export class UpdateDatabaseMigrationDto extends PartialType(CreateDatabaseMigrationDto) {}
