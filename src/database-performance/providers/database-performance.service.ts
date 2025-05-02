import { Injectable } from '@nestjs/common';
import { CreateDatabasePerformanceDto } from './dto/create-database-performance.dto';
import { UpdateDatabasePerformanceDto } from './dto/update-database-performance.dto';

@Injectable()
export class DatabasePerformanceService {
  create(createDatabasePerformanceDto: CreateDatabasePerformanceDto) {
    return 'This action adds a new databasePerformance';
  }

  findAll() {
    return `This action returns all databasePerformance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} databasePerformance`;
  }

  update(id: number, updateDatabasePerformanceDto: UpdateDatabasePerformanceDto) {
    return `This action updates a #${id} databasePerformance`;
  }

  remove(id: number) {
    return `This action removes a #${id} databasePerformance`;
  }
}
