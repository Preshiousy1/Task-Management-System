import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import type { ValidationArguments } from 'class-validator';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { EntityExists } from '../../../../validators/mysql/entity-exists.validator';
import { Task } from '../../entities/task.entity';

export class CreateTaskLogDto {
  @ApiProperty({
    description:
      'The tag of the log specifies which task field change is being logged',
    example: 'status',
  })
  @IsString()
  @IsNotEmpty()
  tag: string;

  @ApiProperty({
    description: 'The value of the field being logged stores the new input',
    example: 'in-progress',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description:
      'This field is for storing extra info in a stringified json format',
    example: JSON.stringify({
      old_status: 'todo',
    }),
  })
  @IsString()
  @IsNotEmpty()
  meta: string;

  @ApiProperty({
    description: 'The ID of the task being logged',
    example: faker.datatype.uuid(),
  })
  @IsUUID()
  @EntityExists([
    Task,
    (args: ValidationArguments) => ({ id: args.object[args.property] }),
  ])
  task_id: string;
}
