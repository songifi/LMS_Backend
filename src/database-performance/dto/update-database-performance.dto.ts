import { PartialType } from '@nestjs/swagger';
import { CreateDatabasePerformanceDto } from './create-database-performance.dto';

export class UpdateDatabasePerformanceDto extends PartialType(CreateDatabasePerformanceDto) {}
