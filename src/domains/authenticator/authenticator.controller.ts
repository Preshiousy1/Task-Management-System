import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AccountSettingsService } from '@/configs/account-settings/account-settings.service';
import { accountSettingTypes } from '@/constants/account-setting-types';
import { authUser } from '@/utils/helpers/auth.helpers';
import { validateHash } from '@/utils/helpers/hash.helpers';

import type { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthenticatorService } from './authenticator.service';
import { Disable2faDto } from './dto/disable-2fa.dto';

@ApiBearerAuth()
@ApiTags('Authentication')
@Controller({
  path: 'authenticator',
  version: '1',
})
export class AuthenticatorController {
  constructor(
    private authenticatorService: AuthenticatorService,
    private accountSettingsService: AccountSettingsService,
    private userService: UsersService,
  ) {}

  @Post('enable')
  @HttpCode(HttpStatus.OK)
  async enable() {
    const user = authUser();
    let secretSetting = await this.accountSettingsService.getUserSetting({
      userId: user.id,
      name: accountSettingTypes.AuthenticatorSecret,
    });

    if (secretSetting) {
      throw new ForbiddenException('Authenticator app 2fa is already enabled');
    }

    secretSetting = await this.accountSettingsService.create({
      user_id: user.id,
      name: accountSettingTypes.AuthenticatorSecret,
      value: this.authenticatorService.generateSecret(),
      data_type: 'string',
    });

    const barcodeUrl = await this.authenticatorService.generateBarCode(
      'TaskManagementSystem',
      user.email,
      secretSetting.value,
    );

    return {
      data: barcodeUrl,
      message:
        'authenticator app 2fa enabled. Scan the QR code with your authenticator app',
    };
  }

  @Post('disable')
  @HttpCode(HttpStatus.OK)
  async disable(@Body() disable2faDto: Disable2faDto) {
    const user = authUser();
    const secretSetting = await this.accountSettingsService.getUserSetting({
      userId: user.id,
      name: accountSettingTypes.AuthenticatorSecret,
    });

    if (!secretSetting) {
      throw new ForbiddenException('Authenticator app 2fa is not enabled');
    }

    const dbUser = (await this.userService.findById(user.id)) as User;

    const isPasswordValid = await validateHash(
      disable2faDto.password,
      dbUser.password,
    );

    if (!isPasswordValid) {
      throw new UnprocessableEntityException('Invalid credentials');
    }

    await this.accountSettingsService.deleteSetting(secretSetting.id);

    return {
      message: 'authenticator app 2fa disabled',
    };
  }

  @Get('status')
  async checkStatus() {
    const user = authUser();
    const secretSetting = await this.accountSettingsService.getUserSetting({
      userId: user.id,
      name: accountSettingTypes.AuthenticatorSecret,
    });

    return {
      data: Boolean(secretSetting),
    };
  }
}
