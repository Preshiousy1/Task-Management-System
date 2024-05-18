import { ApiProperty } from '@nestjs/swagger';
import type { ValidationArguments } from 'class-validator';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { EntityExists } from '../../../../validators/mysql/entity-exists.validator';
import { Task } from '../../entities/task.entity';

export class CreateTaskLogDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  tag: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  value: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  meta: string;

  @IsUUID()
  @EntityExists([
    Task,
    (args: ValidationArguments) => ({ id: args.object[args.property] }),
  ])
  @ApiProperty()
  task_id: string;
}
