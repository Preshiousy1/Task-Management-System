import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm';

import type { CreateTaskLogDto } from './dto/create-task-log.dto';
import type { UpdateTaskLogDto } from './dto/update-task-log.dto';
import { TaskLog } from './entities/task-log.entity';

@Injectable()
export class TaskLogsService {
  constructor(
    @InjectRepository(TaskLog)
    private taskLogRepo: Repository<TaskLog>,
  ) {}

  async create(createTaskLogDto: CreateTaskLogDto) {
    return this.taskLogRepo.save(this.taskLogRepo.create(createTaskLogDto));
  }

  findAll() {
    return this.taskLogRepo.find({});
  }

  async findOne(id: string) {
    await this.taskLogExists(id);

    return this.taskLogRepo.findOneBy({ id });
  }

  async findBy(where: FindOptionsWhere<TaskLog>): Promise<TaskLog[]> {
    return this.taskLogRepo.findBy(where);
  }

  async findOneBy(where: FindOptionsWhere<TaskLog>): Promise<TaskLog | null> {
    return this.taskLogRepo.findOneBy(where);
  }

  async findByLatest(
    filters: FindOptionsWhere<TaskLog>,
  ): Promise<TaskLog[] | null> {
    return this.taskLogRepo.find({
      where: filters,
      order: { created_at: 'DESC' },
      take: 1,
    });
  }

  async update(id: string, updateTaskLogDto: UpdateTaskLogDto) {
    await this.taskLogExists(id);

    return this.taskLogRepo.update(id, updateTaskLogDto);
  }

  async remove(id: string) {
    await this.taskLogExists(id);

    return this.taskLogRepo.delete(id);
  }

  async taskLogExists(id: string) {
    const isFound = await this.taskLogRepo.exists({ where: { id } });

    if (!isFound) {
      throw new NotFoundException('Task Log not found');
    }
  }
}
