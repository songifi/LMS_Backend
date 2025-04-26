import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RoleEnum } from 'src/user/role.enum';

@Injectable()
export class ForumAccessInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Skip check for admins
    if (user.role === RoleEnum.ADMIN) {
      return next.handle();
    }

    return next.handle();
  }
}
