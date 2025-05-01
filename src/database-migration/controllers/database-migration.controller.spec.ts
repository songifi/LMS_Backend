import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseMigrationController } from './database-migration.controller';
import { DatabaseMigrationService } from '../providers/database-migration.service';

describe('DatabaseMigrationController', () => {
  let controller: DatabaseMigrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabaseMigrationController],
      providers: [DatabaseMigrationService],
    }).compile();

    controller = module.get<DatabaseMigrationController>(DatabaseMigrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
