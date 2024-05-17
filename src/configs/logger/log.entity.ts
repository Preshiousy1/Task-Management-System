import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/base-entity';
import { UseDto } from '@/decorators/use-dto.decorator';

import { LogDto } from './dto/log.dto';

@Entity({ name: 'logs' })
@UseDto(LogDto)
export class Log extends BaseEntity<LogDto> {
  @Column({ type: 'varchar', length: 100 })
  env: string;

  @Column({ type: 'varchar', length: 100 })
  context: string | null;

  @Column({ type: 'varchar', length: 100 })
  level: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text' })
  stack: string | null;

  @Column({ type: 'text' })
  data: string | null;
}
