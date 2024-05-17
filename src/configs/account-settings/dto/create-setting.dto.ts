export class CreateAccountSettingDto {
  user_id: string;

  name: string;

  data_type: 'string' | 'number' | 'boolean' | 'object';

  value: string;

  expired_at?: number;
}
