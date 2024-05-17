import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import type { AuthUser } from '@/domains/auth/dto/auth-user.dto';

import { ContextProvider } from '../providers';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    const user = <AuthUser | undefined>request.user;
    ContextProvider.setAuthUser(user);

    return next.handle();
  }
}
