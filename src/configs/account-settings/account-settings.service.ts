import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccountSetting } from './account-setting.entity';
import type { CreateAccountSettingDto } from './dto/create-setting.dto';
import type { UpdateAccountSettingDto } from './dto/update-setting.dto';

@Injectable()
export class AccountSettingsService {
  constructor(
    @InjectRepository(AccountSetting)
    private settingRepository: Repository<AccountSetting>,
  ) {}

  async create(createSettingDto: CreateAccountSettingDto) {
    const setting = this.settingRepository.create(createSettingDto);

    return this.settingRepository.save(setting);
  }

  async getUserSettings(userId: string) {
    return this.settingRepository.findBy({
      user_id: userId,
    });
  }

  async getUserSetting(options: { userId: string; name: string }) {
    return this.settingRepository.findOneBy({
      user_id: options.userId,
      name: options.name,
    });
  }

  async updateSetting(id: string, updateSettingDto: UpdateAccountSettingDto) {
    return this.settingRepository.update({ id }, updateSettingDto);
  }

  async deleteSetting(id: string) {
    return this.settingRepository.delete({ id });
  }
}
