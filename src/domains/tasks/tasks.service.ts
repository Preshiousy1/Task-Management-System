import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { Like, Repository } from 'typeorm';

import { taskStatus } from '@/constants/tasks';

import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import type { CreateTaskLogDto } from './task-logs/dto/create-task-log.dto';
import { TaskLogsService } from './task-logs/task-logs.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @Inject(TaskLogsService)
    private taskLogService: TaskLogsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, created_by: string) {
    // 'This action adds a new task'
    const status = createTaskDto.status ?? taskStatus.Todo;
    const task = this.taskRepo.create({
      ...createTaskDto,
      description: createTaskDto.description ?? '',
      status,
      duration: createTaskDto.duration ?? 0,
      created_by,
      owner_id: createTaskDto.owner_id ?? created_by,
    });

    const createTask = await this.taskRepo.save(task);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (createTask) {
      await this.writeTaskLog(
        task,
        'created',
        'task created',
        JSON.stringify(createTask),
      );
    }

    return createTask;
  }

  findAll() {
    // `This action returns all tasks`
    return this.taskRepo.find({
      relations: {
        createdBy: true,
        ownedBy: true,
        dependsOn: true,
        dependentTasks: true,
        task_logs: true,
      },
    });
  }

  async findOne(id: string) {
    // This action returns a #${id} task`
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: {
        createdBy: true,
        ownedBy: true,
        dependsOn: true,
        dependentTasks: true,
        task_logs: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async findManyBy(where: FindOptionsWhere<Task>): Promise<Task[]> {
    if (where.title) {
      where.title = Like(`%${where.title}%`);
    }

    return this.taskRepo.find({
      where,
      relations: {
        createdBy: true,
        ownedBy: true,
        dependsOn: true,
        dependentTasks: true,
        task_logs: true,
      },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    // `This action updates a #${id} task`
    const { status, dependent_task_id } = updateTaskDto;
    const task = await this.findOne(id);

    //This check makes sure that any task this task depends on is completed first before it is completed.
    if (status && (dependent_task_id || task.dependent_task_id)) {
      const dependsOn = await this.findOne(
        dependent_task_id ?? task.dependent_task_id!,
      );

      if (status === taskStatus.Done && dependsOn.status !== taskStatus.Done) {
        throw new BadRequestException(
          `You can not move this task to 'done' until its dependent task has been moved to 'done'.`,
        );
      }
    }

    const update = await this.taskRepo.update(id, { ...updateTaskDto });

    //log status changes
    if (
      update.affected &&
      update.affected > 0 &&
      status &&
      task.status !== status
    ) {
      await this.writeTaskLog(
        task,
        'status',
        status as string,
        JSON.stringify({ old_status: task.status }),
      );
    }

    return update;
  }

  async remove(id: string) {
    // `This action removes a #${id} task`
    const task = await this.findOne(id);

    if (task.dependentTasks && task.dependentTasks.length > 0) {
      throw new BadRequestException(
        `You can not delete this task because other tasks depend on it.`,
      );
    }

    const deleted = await this.taskRepo.delete({ id });

    //log task deletion
    if (deleted.affected) {
      await this.writeTaskLog(
        task,
        'delete',
        'task was deleted',
        JSON.stringify(task),
      );
    }

    return deleted;
  }

  private async writeTaskLog(
    task: Pick<Task, 'id'>,
    tag: string,
    value: string,
    meta = '{}',
  ) {
    const newTaskLogDto: CreateTaskLogDto = {
      task_id: task.id,
      meta,
      tag,
      value,
    };

    return this.taskLogService.create(newTaskLogDto);
  }
}
