import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';
import { FacultyDashboardService } from './faculty-dashboard.service';
import { Faculty } from './entities/faculty.entity';
import { Department } from './entities/department.entity';
import { FacultySettings } from './entities/faculty-settings.entity';
import { FacultyAdministrator } from './entities/faculty-administrator.entity';
import { UsersModule } from 'src/user/user.module';
import { FacultyPermissionGuard } from './guards/faculty-permission.guard';
import { CacheService } from 'src/cache/cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Faculty,
      Department,
      FacultySettings,
      FacultyAdministrator
    ]),
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL
      max: 100 // maximum number of items in cache
    }),
    UsersModule // To access UserService
  ],
  controllers: [FacultyController],
  providers: [
    FacultyService,
    FacultyDashboardService,
    CacheService,
    FacultyPermissionGuard
  ],
  exports: [
    FacultyService,
    FacultyDashboardService
  ]
})
export class FacultyModule {}