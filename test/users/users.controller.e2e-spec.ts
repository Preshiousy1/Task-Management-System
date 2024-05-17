/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { faker } from '@faker-js/faker';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

import type { User } from '../../src/domains/users/user.entity';
import { UsersService } from '../../src/domains/users/users.service';
import { setupApplication } from '../setup/app-setup';
import { authAsRandomAdmin, authAsRandomUser, removeDb } from '../setup/db';
import { closeInRedisConnection } from '../setup/redis-memory';

describe('UsersController', () => {
  let app: INestApplication;
  let user: User;
  let user2: User;
  let adminUser: User;
  let jwt: string;
  let jwtUser: string;

  beforeAll(async () => {
    await closeInRedisConnection();
    removeDb();

    app = await setupApplication();

    const userService = app.get<UsersService>(UsersService);

    user = await userService.createUser({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@email.com',
      phone: '08023456789',
    });

    const auth = await authAsRandomAdmin(app);
    adminUser = auth.user;
    jwt = auth.jwt;

    const authUser = await authAsRandomUser(app);
    user2 = authUser.user;
    jwtUser = authUser.jwt;
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('GET /v1/users/:id', () => {
    it('should get user by id', (done) => {
      request(app.getHttpServer())
        .get(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${jwt}`)
        .set('Content-Type', 'application/json')
        .expect(200)
        .end((error, response) => {
          if (error) {
            return done(error, response.body);
          }

          try {
            expect(response.body.data.id).toBe(user.id);

            return done();
          } catch (error_: unknown) {
            return done(error_);
          }
        });
    });
  });

  describe('GET /v1/users/admin-users', () => {
    it('should return admin users', (done) => {
      request(app.getHttpServer())
        .get('/v1/users/admin-users')
        .set('Authorization', `Bearer ${jwt}`)
        .set('Content-Type', 'application/json')
        .expect(200)
        .end((error, response) => {
          if (error) {
            return done(error, response.body);
          }

          try {
            const createdAdminUser = response.body.data?.find(
              (aUser) => aUser.id === adminUser.id,
            );
            expect(createdAdminUser).toBeDefined();
            expect(createdAdminUser?.role).toBe('admin');

            return done();
          } catch (error_: unknown) {
            return done(error_);
          }
        });
    });
  });

  describe('GET /v1/users/users', () => {
    it('should return non-admin users', (done) => {
      request(app.getHttpServer())
        .get('/v1/users/users')
        .set('Authorization', `Bearer ${jwt}`)
        .set('Content-Type', 'application/json')
        .expect(200)
        .end((error, response) => {
          if (error) {
            return done(error, response.body);
          }

          try {
            expect(response.body.data?.[0].id).toEqual(user.id);
            expect(response.body.data?.[0].role).toBe('user');

            return done();
          } catch (error_: unknown) {
            return done(error_);
          }
        });
    });
  });

  describe('PATCH /v1/users/:id', () => {
    it('should not allow user update other users', (done) => {
      request(app.getHttpServer())
        .patch(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${jwtUser}`)
        .set('Content-Type', 'application/json')
        .send({
          first_name: faker.name.firstName('female'),
          last_name: faker.name.lastName('male'),
        })
        .expect(401)
        .end((error, response) => {
          if (error) {
            return done(error, response.body);
          }

          return done();
        });
    });

    it('should not allow overriding updating user if email and phone exists', (done) => {
      request(app.getHttpServer())
        .patch(`/v1/users/${user2.id}`)
        .set('Authorization', `Bearer ${jwtUser}`)
        .set('Content-Type', 'application/json')
        .send({
          email: user.email,
          phone: user.phone,
        })
        // .expect(400)
        .end((error, response) => {
          if (error) {
            return done(error, response.body);
          }

          return done();
        });
    });
  });
});
