import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../permission.service';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
    private requestContextService: RequestContextService,
    private rbacMetadata: RbacMetadata,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from the metadata
    const requiredPermissions = this.rbacMetadata.getRequiredPermissions(context);
    
    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = this.requestContextService.getCurrentUser(request);
    
    // If no user is authenticated, deny access
    if (!user) {
      throw new ForbiddenException('You need to be authenticated to access this resource');
    }
    
    // Check if the user has any of the required permissions
    for (const permission of requiredPermissions) {
      const hasPermission = await this.permissionService.checkUserPermission(
        user.id,
        permission,
      );
      
      if (hasPermission) {
        return true;
      }
    }
    
    throw new ForbiddenException('You do not have permission to access this resource');
  }
}