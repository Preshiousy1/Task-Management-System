import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../../common/dto/base.dto';
import type { TaskLog } from '../entities/task-log.entity';

export class TaskLogDto extends BaseDto {
  @ApiProperty()
  tag: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  meta: string;

  @ApiProperty()
  task_id: string;

  constructor(taskLog: TaskLog) {
    super(taskLog);
    this.tag = taskLog.tag;
    this.value = taskLog.value;
    this.meta = taskLog.meta;
    this.task_id = taskLog.task_id;
  }

  public static truncateValue(value: string) {
    // Limit the size of the text to the maximum size allowed by the column
    const maxLength = 64_000; // This is the maximum size allowed by a TEXT column in MySQL

    return value.trim().slice(0, Math.max(0, maxLength));
  }

  public static collection(entities: TaskLog[]) {
    return entities.map((entity) => entity.toDto());
  }
}
