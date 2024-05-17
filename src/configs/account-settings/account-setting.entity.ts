import { AfterInsert, AfterLoad, AfterUpdate, Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base-entity';
import { convertToType } from '@/utils/helpers/general.helpers';

@Entity({ name: 'account_settings' })
export class AccountSetting extends BaseEntity {
  @Column('varchar', { length: 100 })
  user_id: string;

  @Column('varchar', { length: 100, nullable: true })
  business_id?: string;

  @Column('varchar', { length: 50 })
  name: string;

  @Column('varchar', { length: 50, default: 'string' })
  data_type: 'string' | 'number' | 'boolean' | 'object';

  @Column('varchar', { length: 250 })
  value: string;

  setting: string | number | boolean | Record<string, unknown>;

  @Column({ type: 'bigint', width: 11, nullable: true })
  expired_at?: number;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  public parseSetting() {
    this.setting = convertToType(this.value, this.data_type);
  }
}
