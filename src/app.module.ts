import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiConfigService } from './configs/api-config/api-config.service';
import { ConfigsModule } from './configs/configs.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './domains/auth/auth.module';
import { DataStreamGateway } from './domains/data-stream/data-stream.gateway';
import { TasksModule } from './domains/tasks/tasks.module';
import { UsersModule } from './domains/users/users.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TaskSchedulerModule } from './task-scheduler/task-scheduler.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ApiConfigService],
      useFactory: (config: ApiConfigService) => config.throttleConfig,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: true,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: true,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    BullModule.forRootAsync({
      imports: [ConfigsModule],
      useFactory: (configService: ApiConfigService) => ({
        prefix: configService.get<string>('QUEUE_PREFIX'),
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: Number(configService.get<string>('REDIS_PORT')),
        },
      }),
      inject: [ApiConfigService],
    }),

    ConfigsModule,
    UsersModule,
    DatabaseModule,
    AuthModule,
    TaskSchedulerModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService,
    DataStreamGateway,
  ],
})
export class AppModule {}
