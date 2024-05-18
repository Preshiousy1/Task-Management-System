import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../common/dto/base.dto';
import { Task } from '../entities/task.entity';
import { TaskStatus, TaskType } from '@/types';
import { User } from '@/domains/users/user.entity';
import { taskStatus, taskTypes } from '@/constants/tasks';
import { faker } from '@faker-js/faker';
import { TaskLog } from '../task-logs/entities/task-log.entity';

export class TaskDto extends BaseDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Contact 5 prospective customers',
  })
  title: string;

  @ApiProperty({
    description: 'The description of the task',
    example:
      'Pick the first 5 contacts on our contacts sheet and call them to confirm their interest in our product.',
  })
  description: string;

  @ApiProperty({
    description: 'The status of this task',
    example: taskStatus.InProgress,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'The type of task it is',
    example: taskTypes.Sales,
  })
  type: TaskType;

  @ApiProperty({
    description: 'The duration of the task in hours',
    example: 2,
  })
  duration: number;

  @ApiProperty({
    description:
      'The task id of another task that this task depends on, if any.',
    example: faker.datatype.uuid(),
  })
  dependent_task_id: string | null;

  @ApiProperty({
    description: 'The ID of the user responsible for this task',
    example: faker.datatype.uuid(),
  })
  owner_id: string | null;

  @ApiProperty({
    description: 'The ID of the user that created this task',
    example: faker.datatype.uuid(),
  })
  created_by: string;

  createdBy?: User;
  ownedBy?: User;
  dependsOn?: Task;
  dependentTasks?: Task[];
  task_logs?: TaskLog[];

  constructor(task: Task) {
    super(task);

    this.title = task.title;

    this.description = task.description;

    this.status = task.status;

    this.type = task.type;

    this.duration = task.duration;

    this.dependent_task_id = task.dependent_task_id;

    this.created_by = task.created_by;

    this.owner_id = task.owner_id;

    if (task.ownedBy) {
      this.ownedBy = task.ownedBy;
    }
    if (task.createdBy) {
      this.createdBy = task.createdBy;
    }
    if (task.dependsOn) {
      this.dependsOn = task.dependsOn;
    }
    if (task.dependentTasks) {
      this.dependentTasks = task.dependentTasks;
    }
    if (task.task_logs) {
      this.task_logs = task.task_logs;
    }
  }

  public static collection(entities: Task[]) {
    return entities.map((entity) => entity.toDto());
  }
}
