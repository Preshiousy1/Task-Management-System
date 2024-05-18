import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { taskStatus } from '@/constants/tasks';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>, // @Inject(ApiConfigService) // private configService: ApiConfigService,
  ) {}
  create(createTaskDto: CreateTaskDto, created_by: string) {
    // 'This action adds a new task'
    const task = this.taskRepo.create({
      ...createTaskDto,
      description: createTaskDto.description ?? '',
      status: createTaskDto.status ?? taskStatus.Todo,
      duration: createTaskDto.duration ?? 0,
      created_by,
      owner_id: createTaskDto.owner_id ?? created_by,
    });

    return this.taskRepo.save(task);
  }

  findAll() {
    // `This action returns all tasks`
    return this.taskRepo.find({
      relations: {
        createdBy: true,
        ownedBy: true,
        dependsOn: true,
        dependentTasks: true,
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

    return this.taskRepo.update(id, { ...updateTaskDto });
  }

  async remove(id: string) {
    // `This action removes a #${id} task`
    const task = await this.findOne(id);
    if (task.dependentTasks && task.dependentTasks.length > 0) {
      throw new BadRequestException(
        `You can not delete this task because other tasks depend on it.`,
      );
    }

    return this.taskRepo.delete({ id });
  }
}
