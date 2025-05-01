import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseMigrationService } from './database-migration.service';

describe('DatabaseMigrationService', () => {
  let service: DatabaseMigrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseMigrationService],
    }).compile();

    service = module.get<DatabaseMigrationService>(DatabaseMigrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
