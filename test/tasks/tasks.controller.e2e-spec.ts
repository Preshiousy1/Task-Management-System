/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { faker } from '@faker-js/faker';
import {
  type HttpServer,
  type INestApplication,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import request from 'supertest';

import { setupApplication } from '../setup/app-setup';
import { authAsRandomAdmin, authAsRandomUser, removeDb } from '../setup/db';
import { closeInRedisConnection } from '../setup/redis-memory';
import { TasksService } from '../../src/domains/tasks/tasks.service';
import { Task } from '../../src/domains/tasks/entities/task.entity';
import { CreateTaskDto } from '../../src/domains/tasks/dto/create-task.dto';
import { taskTypes, taskStatus } from '../../src/constants/tasks';
import { User } from '../../src/domains/users/user.entity';

describe('TasksController (E2E)', () => {
  let app: INestApplication;
  let server: HttpServer;
  let jwtAdmin: string;
  let jwtUser: string;
  let adminUser: User;
  let user: User;
  let taskService: TasksService;
  let task: Task;
  let incompleteTask: Task;
  let createTaskDto: CreateTaskDto;

  beforeAll(async () => {
    await closeInRedisConnection();
    removeDb();

    app = await setupApplication();
    server = app.getHttpServer();

    taskService = app.get<TasksService>(TasksService);

    const randomUser = await authAsRandomUser(app);
    const admin = await authAsRandomAdmin(app);

    adminUser = admin.user;
    user = randomUser.user;

    jwtAdmin = admin.jwt;
    jwtUser = randomUser.jwt;

    createTaskDto = {
      title: 'Family Living Task',
      status: taskStatus.InProgress,
      type: taskTypes.BugFix,
      duration: 3,
      owner_id: user.id,
    };

    task = await taskService.create(createTaskDto, adminUser.id);

    task = await taskService.findOne(task.id);
  });

  afterAll(async () => {
    await Promise.all([app.close(), server.close()]);
  });

  describe('GET /v1/tasks', () => {
    it('should return a list of tasks', (done) => {
      request(server)
        .get('/v1/tasks')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
          }

          expect(res.body.data.length).toBe(1);

          done();
        });
    });

    it('should return a single task', (done) => {
      request(server)
        .get(`/v1/tasks/${task.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(
          {
            data: JSON.parse(JSON.stringify(task.toDto())),
          },
          done,
        );
    });

    it('should return tasks that match the given query params', (done) => {
      request(server)
        .get(`/v1/tasks/find-by?owner_id=${task.owner_id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          {
            data: JSON.parse(
              JSON.stringify([
                {
                  ...task.toDto(),
                },
              ]),
            ),
          },
          done,
        );
    });
  });

  describe('POST /v1/tasks', () => {
    it('should throw an error since user is not authenticated', (done) => {
      request(server)
        .post('/v1/tasks')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });

    it('should create a task', async () => {
      const taskDto: CreateTaskDto = {
        title: 'Family Living Task',
        description: '',
        type: taskTypes.Task,
        dependent_task_id: task.id,
        duration: 2,
      };

      const res = await request(server)
        .post('/v1/tasks')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send(taskDto)
        .expect('Content-Type', /json/)
        .expect(201);
      expect(res.body.data.title).toBe(taskDto.title);
      expect(res.body.data.type).toBe(taskDto.type);
      expect(res.body.data.status).toBe(taskStatus.Todo);
      expect(res.body.data.owner_id).toBe(adminUser.id);
      incompleteTask = res.body.data;
    });
  });

  describe('PATCH /v1/tasks/:id', () => {
    it('should throw an error if attempting to move a dependent task status to done without completing the parent task', (done) => {
      request(server)
        .patch(`/v1/tasks/${incompleteTask.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ status: taskStatus.Done })
        .expect('Content-Type', /json/)
        .expect(400)
        .then(async (res) => {
          //then update its parent to done
          await taskService.update(task.id, { status: taskStatus.Done });
          done();
        });
    });

    it("should update a task's status", (done) => {
      request(server)
        .patch(`/v1/tasks/${incompleteTask.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ status: taskStatus.Done })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
          }

          expect(res.body.message).toContain('Task updated.');

          done();
        });
    });
  });

  describe('DELETE /v1/tasks', () => {
    it('should throw an error if the Task has dependents', async () => {
      try {
        const deleteTask: request.Response = await request(server)
          .delete(`/v1/tasks/${task.id}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${jwtAdmin}`);

        expect(deleteTask.type).toMatch(/json/);
        expect(deleteTask.status).toEqual(400);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should delete the tasks if it exist', async () => {
      const deleteTask: request.Response = await request(server)
        .delete(`/v1/tasks/${incompleteTask.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwtAdmin}`);

      expect(deleteTask.type).toMatch(/json/);
      expect(deleteTask.status).toEqual(200);
    });

    it('should throw an error if the Task does not exist', async () => {
      try {
        const deleteTask: request.Response = await request(server)
          .delete(`/v1/tasks/${faker.datatype.uuid()}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${jwtAdmin}`);

        expect(deleteTask.type).toMatch(/json/);
        expect(deleteTask.status).toEqual(404);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
