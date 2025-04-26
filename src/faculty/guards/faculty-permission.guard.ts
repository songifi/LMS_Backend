import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacultyAdministrator } from '../entities/faculty-administrator.entity';

// Define a decorator for faculty permissions
export const RequireFacultyPermission = (permission: string) => {
  return (target, key, descriptor) => {
    Reflect.defineMetadata('faculty_permission', permission, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class FacultyPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(FacultyAdministrator)
    private facultyAdminRepository: Repository<FacultyAdministrator>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permission
    const requiredPermission = this.reflector.get<string>('faculty_permission', context.getHandler());
    
    // If no specific permission is required, allow access
    if (!requiredPermission) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Global admin can do anything
    if (user.role === 'admin') {
      return true;
    }
    
    // Extract faculty ID from params
    const facultyId = request.params.id;
    if (!facultyId) {
      return false;
    }
    
    // Check if user is an administrator for this faculty with the required permission
    const admin = await this.facultyAdminRepository.findOne({
      where: {
        facultyId,
        userId: user.id,
        isActive: true
      }
    });
    
    if (!admin) {
      throw new ForbiddenException('You are not an administrator for this faculty');
    }
    
    // Special case: faculty dean has all permissions
    if (admin.role === 'dean') {
      return true;
    }
    
    // Check if user has the required permission
    if (admin.permissions && admin.permissions.includes(requiredPermission)) {
      return true;
    }
    
    throw new ForbiddenException(`You do not have the required permission: ${requiredPermission}`);
  }
}