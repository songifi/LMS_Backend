import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UsersController } from './user.controller';
import { PermissionsController } from './permission.controller';
import { UsersService } from './providers/user.service';
import { PermissionsService } from './providers/permission.service';
import { RoleService } from './providers/role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  controllers: [UsersController, RolesController, PermissionsController],
  providers: [UsersService, RoleService, PermissionsService],
  exports: [UsersService, RoleService, PermissionsService,TypeOrmModule],
})
export class UsersModule {}