import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AdminRoleGuard } from '@/guards/admin.guard';

import { QueryTaskLogDto } from './dto/query-task-log.dto';
import { TaskLogDto } from './dto/task-log-dto';
import { TaskLogsService } from './task-logs.service';

@ApiTags('Task')
@ApiBearerAuth()
@Controller({ path: 'task-logs', version: '1' })
export class TaskLogsController {
  constructor(private readonly taskLogService: TaskLogsService) {}

  @UseGuards(AdminRoleGuard)
  @ApiOkResponse({
    description: 'Read all task logs.',
    type: [TaskLogDto],
  })
  @Get()
  async findAll() {
    const taskLogs = await this.taskLogService.findAll();

    return { data: TaskLogDto.collection(taskLogs) };
  }

  @ApiOkResponse({
    description: 'Read task logs that match the given query parameters.',
    type: [TaskLogDto],
  })
  @Get('find-by')
  async findBy(
    @Query() query: QueryTaskLogDto,
  ): Promise<{ data: TaskLogDto[] }> {
    const taskLogs = await this.taskLogService.findBy(query);

    return { data: TaskLogDto.collection(taskLogs) };
  }

  @ApiOkResponse({
    description: 'Read task log by id.',
    type: TaskLogDto,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const taskLog = await this.taskLogService.findOne(id);

    return { data: taskLog?.toDto() };
  }
}
