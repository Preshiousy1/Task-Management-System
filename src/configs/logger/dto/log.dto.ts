import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '@/common/dto/base.dto';

import type { Log } from '../log.entity';

export class LogDto extends BaseDto {
  @ApiProperty({
    example: 'development',
    description: 'The environment where the log was created',
  })
  env: string;

  @ApiProperty({
    example: 'TaskService',
    description: 'The context where the log was created',
  })
  context: string | null;

  @ApiProperty({
    example: 'error',
    description: 'The level of the log',
  })
  level: string;

  @ApiProperty({
    example: 'Something went wrong',
    description: 'The message of the log',
  })
  message: string;

  @ApiProperty({
    example: 'Error: Something went wrong',
    description: 'The stack trace of the log',
  })
  stack: string | null;

  @ApiProperty({
    example: '{"context": "TaskService"}',
    description: 'The data of the log',
  })
  data: string | null;

  constructor(log: Log) {
    super(log);

    this.env = log.env;
    this.context = log.context;
    this.level = log.level;
    this.message = log.message;
    this.stack = log.stack;
    this.data = log.data;
  }

  public static collection(entities: Log[]) {
    return entities.map((entity) => entity.toDto());
  }
}
