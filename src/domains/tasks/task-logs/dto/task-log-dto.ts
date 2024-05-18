import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../../common/dto/base.dto';
import type { TaskLog } from '../entities/task-log.entity';
import { faker } from '@faker-js/faker';

export class TaskLogDto extends BaseDto {
  @ApiProperty({
    description:
      'The tag of the log specifies which task field change is being logged',
    example: 'status',
  })
  tag: string;

  @ApiProperty({
    description: 'The value of the field being logged stores the new input',
    example: 'in-progress',
  })
  value: string;

  @ApiProperty({
    description:
      'This field is for storing extra info in a stringified json format',
    example: JSON.stringify({
      old_status: 'todo',
    }),
  })
  meta: string;

  @ApiProperty({
    description: 'The ID of the task being logged',
    example: faker.datatype.uuid(),
  })
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
