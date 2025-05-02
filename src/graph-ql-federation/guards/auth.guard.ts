import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    
    // Check if the route is public
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    // Get the token from the request
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      // Verify the token
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add the user to the request
      req.user = payload;
      
      // Check if the user has the required roles
      const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
      if (requiredRoles && requiredRoles.length > 0) {
        const userRoles = req.user.roles || [];
        const hasRole = requiredRoles.some(role => userRoles.includes(role));
        if (!hasRole) {
          throw new UnauthorizedException('Insufficient permissions');
        }
      }
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(req: any): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
