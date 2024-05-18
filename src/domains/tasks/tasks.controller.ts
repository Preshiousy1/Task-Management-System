import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiTags } from '@nestjs/swagger';
import { TaskDto } from './dto/task.dto';
import { ReadTaskDto } from './dto/read-task.dto';
import { authUser } from '@/utils/helpers/auth.helpers';

@ApiTags('Tasks')
@Controller({
  version: '1',
  path: 'tasks',
})
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    const creator = authUser();
    return {
      data: await this.tasksService.create(createTaskDto, creator.id),
    };
  }

  @Get()
  async findAll() {
    return {
      data: TaskDto.collection(await this.tasksService.findAll()),
    };
  }

  @Get('find-by')
  async findManyBy(@Query() query: ReadTaskDto) {
    return {
      data: TaskDto.collection(await this.tasksService.findManyBy(query)),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const task = await this.tasksService.findOne(id);

    return { data: task.toDto() };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const update = await this.tasksService.update(id, updateTaskDto);

    if (update.affected === 0) {
      throw new NotFoundException('Task not found.');
    }

    return { message: 'Task updated.' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.tasksService.remove(id);

    if (!data.affected) {
      throw new Error('Task could not be deleted');
    }

    return { message: 'Task deleted' };
  }
}
