import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';

import { AuthUser } from '@/domains/auth/dto/auth-user.dto';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | null;

    if (!user) {
      return false;
    }

    return AuthUser.isAdmin(user);
  }
}
