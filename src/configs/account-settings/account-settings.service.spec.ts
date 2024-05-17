import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AccountSetting } from './account-setting.entity';
import { AccountSettingsService } from './account-settings.service';

describe('AccountSettingsService', () => {
  let service: AccountSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountSettingsService,
        {
          provide: getRepositoryToken(AccountSetting),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AccountSettingsService>(AccountSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
