import { UseDto } from '@/decorators/use-dto.decorator';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TaskDto } from '../dto/task.dto';
import { BaseEntity } from '../../../common/base-entity';
import { User } from '@/domains/users/user.entity';
import { TaskStatus, TaskType } from '@/types';
import { TaskLog } from '../task-logs/entities/task-log.entity';

@Entity({ name: 'tasks' })
@UseDto(TaskDto)
export class Task extends BaseEntity<TaskDto> {
  @Column('varchar', { length: 250 })
  title: string;

  @Column('text')
  description: string;

  @Column('varchar', { length: 100 })
  status: TaskStatus;

  @Column('varchar', { length: 100 })
  type: TaskType;

  @Column('int')
  duration: number;

  @Column('varchar', { length: 100, nullable: true })
  dependent_task_id: string | null;

  @Column('varchar', { length: 100, nullable: true })
  owner_id: string | null;

  @Column('varchar', { length: 100 })
  created_by: string;

  // relations
  @ManyToOne(() => User, (user) => user.createdTasks)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdBy?: User;

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'owner_id', referencedColumnName: 'id' })
  ownedBy?: User;

  @ManyToOne(() => Task, (task) => task.dependentTasks)
  @JoinColumn({ name: 'dependent_task_id', referencedColumnName: 'id' })
  dependsOn?: Task;

  @OneToMany(() => Task, (dependentTasks) => dependentTasks.dependsOn)
  dependentTasks?: Task[];

  @OneToMany(() => TaskLog, (taskLogs) => taskLogs.task)
  task_logs?: TaskLog[];
}
