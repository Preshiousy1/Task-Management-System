import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../../common/base-entity';
import { UseDto } from '../../../../decorators/use-dto.decorator';
import { Task } from '../../entities/task.entity';
import { TaskLogDto } from '../dto/task-log-dto';

@Entity({ name: 'task_logs' })
@UseDto(TaskLogDto)
export class TaskLog extends BaseEntity<TaskLogDto> {
  @Column({ type: 'varchar', length: 100 })
  tag: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'text' })
  meta: string;

  @Column({ type: 'varchar', length: 100 })
  task_id: string;

  @ManyToOne(() => Task, (task) => task.task_logs)
  @JoinColumn({ name: 'task_id' })
  task?: Task;
}
