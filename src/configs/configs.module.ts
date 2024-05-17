import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountSetting } from './account-settings/account-setting.entity';
import { AccountSettingsService } from './account-settings/account-settings.service';
import { ApiConfigService } from './api-config/api-config.service';
import { AppLoggerService } from './logger/app-logger.service';
import { Log } from './logger/log.entity';

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([AccountSetting, Log])],
  providers: [ApiConfigService, AccountSettingsService, AppLoggerService],
  exports: [
    ApiConfigService,
    AccountSettingsService,
    TypeOrmModule,
    AppLoggerService,
  ],
})
export class ConfigsModule {}
