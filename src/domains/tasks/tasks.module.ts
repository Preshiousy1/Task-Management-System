import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { TaskLogsModule } from './task-logs/task-logs.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), TaskLogsModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService, TypeOrmModule],
})
export class TasksModule {}
