import { taskStatus, taskTypes } from '@/constants/tasks';
import { TaskStatus, TaskType } from '@/types';
import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class ReadTaskDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Contact 5 prospective customers',
  })
  @IsOptional()
  @IsString()
  title: string;

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
  @IsOptional()
  @IsIn(Object.values(taskTypes))
  type?: TaskType;

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

  @ApiProperty({
    description: 'The ID of the user responsible for this task',
    example: faker.datatype.uuid(),
  })
  @IsOptional()
  @IsUUID()
  created_by?: string;
}
