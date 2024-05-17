import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';

import { AccountSettingsService } from '@/configs/account-settings/account-settings.service';
import { accountSettingTypes } from '@/constants/account-setting-types';
import type { AuthUser } from '@/domains/auth/dto/auth-user.dto';
import { AuthenticatorService } from '@/domains/authenticator/authenticator.service';

@Injectable()
export class AuthenticatorCheckGuard implements CanActivate {
  constructor(
    @Inject(AccountSettingsService)
    private accountSettingService: AccountSettingsService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const user = request.user as AuthUser | null;
    const token = request.query.otp;

    if (!user || !token) {
      return false;
    }

    const secretSetting = await this.accountSettingService.getUserSetting({
      userId: user.id,
      name: accountSettingTypes.AuthenticatorSecret,
    });

    if (!secretSetting) {
      return false;
    }

    return AuthenticatorService.verifySecret({
      token,
      secret: secretSetting.value,
    });
  }
}
