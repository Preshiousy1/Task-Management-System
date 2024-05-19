/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import type { HttpServer, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { taskStatus, taskTypes } from '../../src/constants/tasks';
import type { CreateTaskDto } from '../../src/domains/tasks/dto/create-task.dto';
import type { Task } from '../../src/domains/tasks/entities/task.entity';
import type { CreateTaskLogDto } from '../../src/domains/tasks/task-logs/dto/create-task-log.dto';
import type { TaskLog } from '../../src/domains/tasks/task-logs/entities/task-log.entity';
import { TaskLogsService } from '../../src/domains/tasks/task-logs/task-logs.service';
import { TasksService } from '../../src/domains/tasks/tasks.service';
import { setupApplication } from '../setup/app-setup';
import { authAsRandomAdmin, authAsRandomUser, removeDb } from '../setup/db';
import { closeInRedisConnection } from '../setup/redis-memory';

describe('TaskLogController (e2e)', () => {
  let app: INestApplication;
  let server: HttpServer;
  let jwt: string;
  let adminJwt: string;
  let taskLog: TaskLog;
  let createTaskLogDto: CreateTaskLogDto;

  beforeAll(async () => {
    await closeInRedisConnection();
    removeDb();

    app = await setupApplication();
    server = app.getHttpServer();

    const auth = await authAsRandomUser(app);

    jwt = auth.jwt;

    const taskService = app.get<TasksService>(TasksService);

    const createTaskDto: CreateTaskDto = {
      title: 'Fix website bugs',
      status: taskStatus.InProgress,
      type: taskTypes.BugFix,
      duration: 3,
      owner_id: auth.user.id,
    };
    const task: Task = await taskService.create(createTaskDto, auth.user.id);

    const taskLogService = app.get<TaskLogsService>(TaskLogsService);
    createTaskLogDto = {
      task_id: task.id,
      meta: '{}',
      tag: 'status',
      value: taskStatus.Todo,
    };
    taskLog = await taskLogService.create(createTaskLogDto);

    const adminAuth = await authAsRandomAdmin(app);

    adminJwt = adminAuth.jwt;

    jwt = auth.jwt;
  });

  afterAll(async () => {
    await Promise.all([app.close(), server.close()]);
  });

  describe('GET /task-log', () => {
    it('should not allow non admin read all task logs', () => {
      request(server)
        .get('/v1/task-logs')
        .set('Authorization', `Bearer ${jwt}`)
        .expect(403);
    });

    it('should read all task logs', (done) => {
      request(server)
        .get('/v1/task-logs')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toHaveLength(2);
          done();
        });
    });

    it('should read a single task log', (done) => {
      request(server)
        .get(`/v1/task-logs/${taskLog.id}`)
        .set('Authorization', `Bearer ${jwt}`)
        .expect(200)
        .expect({ data: JSON.parse(JSON.stringify(taskLog.toDto())) }, done);
    });

    it('should read task logs that match a query', (done) => {
      request(server)
        .get(
          `/v1/task-logs/find-by?tag=${createTaskLogDto.tag}&task_id=${createTaskLogDto.task_id}`,
        )
        .set('Authorization', `Bearer ${jwt}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data[0].tag).toEqual(createTaskLogDto.tag);
          expect(res.body.data[0].task_id).toEqual(createTaskLogDto.task_id);
          done();
        });
    });
  });
});
