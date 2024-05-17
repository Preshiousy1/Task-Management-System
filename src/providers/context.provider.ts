import { getValue, setValue } from 'express-ctx';

import type { AuthUser } from '@/domains/auth/dto/auth-user.dto';

export class ContextProvider {
  private static readonly nameSpace = 'request';

  private static readonly authUserKey = 'auth_user';

  private static get<T>(key: string): T | undefined {
    return getValue<T>(ContextProvider.getKeyWithNamespace(key));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static set(key: string, value: any): void {
    setValue(ContextProvider.getKeyWithNamespace(key), value);
  }

  private static getKeyWithNamespace(key: string): string {
    return `${ContextProvider.nameSpace}.${key}`;
  }

  static setAuthUser(user?: AuthUser): void {
    ContextProvider.set(ContextProvider.authUserKey, user);
  }

  static getAuthUser(): AuthUser | undefined {
    return ContextProvider.get<AuthUser>(ContextProvider.authUserKey);
  }
}
