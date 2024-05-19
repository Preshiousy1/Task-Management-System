import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { taskStatus, taskTypes } from '@/constants/tasks';
import { TaskStatus, TaskType } from '@/types';

export class CreateTaskDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Contact 5 prospective customers',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the task',
    example:
      'Pick the first 5 contacts on our contacts sheet and call them to confirm their interest in our product.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The status of this task',
    example: taskStatus.InProgress,
  })
  @IsOptional()
  @IsIn(Object.values(taskStatus))
  status?: TaskStatus;

  @ApiProperty({
    description: 'The type of task it is',
    example: taskTypes.Sales,
  })
  @IsNotEmpty()
  @IsIn(Object.values(taskTypes))
  type: TaskType;

  @ApiProperty({
    description: 'The duration of the task in HOURS',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({
    description:
      'The task id of another task that this task depends on, if any.',
    example: faker.datatype.uuid(),
  })
  @IsOptional()
  @IsUUID()
  dependent_task_id?: string;

  @ApiProperty({
    description: 'The ID of the user responsible for this task',
    example: faker.datatype.uuid(),
  })
  @IsOptional()
  @IsUUID()
  owner_id?: string;
}
