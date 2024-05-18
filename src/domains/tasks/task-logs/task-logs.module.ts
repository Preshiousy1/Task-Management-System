import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EntityTimestampSubscriber } from '../../../database/mysql/subscribers/entity-timestamp.subscriber';
import { TaskLogsController } from './task-logs.controller';
import { TaskLogsService } from './task-logs.service';
import { TaskLog } from './entities/task-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskLog])],
  providers: [TaskLogsService, EntityTimestampSubscriber],
  controllers: [TaskLogsController],
  exports: [TaskLogsService, TypeOrmModule],
})
export class TaskLogsModule {}
