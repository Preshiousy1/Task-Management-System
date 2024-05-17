import { PartialType } from '@nestjs/swagger';

import { CreateAccountSettingDto } from './create-setting.dto';

export class UpdateAccountSettingDto extends PartialType(
  CreateAccountSettingDto,
) {}
