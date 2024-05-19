/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { ApiConfigService } from '../../src/configs/api-config/api-config.service';
import { AuthService } from '../../src/domains/auth/auth.service';
import type { User } from '../../src/domains/users/user.entity';
import { UsersService } from '../../src/domains/users/users.service';
import type { UserRoleType } from '../../src/types';
import { setupApplication } from '../setup/app-setup';
import { authAsRandomUser, removeDb } from '../setup/db';
import { closeInRedisConnection } from '../setup/redis-memory';

describe('AuthController', () => {
  let app: INestApplication;
  let user: User;
  let configService: ApiConfigService;
  let authService: AuthService;
  let token: string;
  let defaultPassword: string;
  beforeAll(async () => {
    await closeInRedisConnection();
    removeDb();

    app = await setupApplication();

    const userService = app.get<UsersService>(UsersService);
    configService = app.get<ApiConfigService>(ApiConfigService);

    defaultPassword = configService.get<string>('TMS_DEFAULT_PASSWORD');
    user = await userService.createUser({
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane.doe@email.com',
      phone: '08041920888',
    });
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('POST /v1/auth/register', () => {
    describe('Register a new user', () => {
      it('should create a new user and register user', (done) => {
        request(app.getHttpServer())
          .post('/v1/auth/register')
          .set('Content-Type', 'application/json')
          .send({
            first_name: 'John',
            last_name: 'Lark',
            email: 'john.lark@email.com',
            phone: '08041920209',
          })
          .expect(201)
          .end((error, response) => {
            if (error) {
              return done(error, response.body);
            }

            expect(response.body.data.email).toBe('john.lark@email.com');
            expect(response.body.data.phone).toBe('08041920209');
            expect(response.body.data.role).toBe('user');

            return done();
          });
      });
    });

    describe('Register an existing user', () => {
      beforeAll(async () => {
        const userService = app.get<UsersService>(UsersService);

        await userService.createUser({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@email.com',
          phone: '08023456789',
        });
      });

      it('should throw an error if tries to register using existing account', (done) => {
        request(app.getHttpServer())
          .post('/v1/auth/register')
          .set('Content-Type', 'application/json')
          .send({
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@email.com',
            phone: '08023456789',
          })
          .expect(401, done);
      });
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should authenticate the user via email and provide access token', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          identifier: user.email,
          password: `${defaultPassword}`,
        })
        .expect(200)
        .end((error, response) => {
          if (error) {
            return done(error, response.body);
          }

          expect(response.body.data.token.accessToken).toBeDefined();
          expect(response.body.data.user.id).toBe(user.id);
          //First Login should be true
          expect(response.body.data.isFirstLogin).toBe(true);

          return done();
        });
    });

    it('should authenticate the user via phone number and provide access token', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
          identifier: user.phone,
          password: `${defaultPassword}`,
        })
        .expect(200)
        .end((error, response) => {
          if (error) {
            return done(error, response.body);
          }

          expect(response.body.data.token.accessToken).toBeDefined();
          expect(response.body.data.user.id).toBe(user.id);
          //First login should now be false
          expect(response.body.data.isFirstLogin).toBe(false);
          token = response.body.data.token.accessToken;

          return done();
        });
    });
  });

  describe('POST /v1/auth/reset-password', () => {
    it('should reset password', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/reset-password')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: 'NewPassword',
        })
        .expect(200)
        .expect({ message: 'Password reset successfully' }, done);
    });

    it('should login with new password', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          identifier: user.email,
          password: 'NewPassword',
        })
        .expect(200)
        .end((error, response) => {
          if (error) {
            return done(error, response.body);
          }

          expect(response.body.data.token.accessToken).toBeDefined();
          expect(response.body.data.user.id).toBe(user.id);

          return done();
        });
    });
  });

  describe('POST /v1/auth/forgot-password', () => {
    beforeAll(async () => {
      authService = app.get<AuthService>(AuthService);

      const tokenPayLoad = await authService.createAccessToken({
        userId: user.id,
        role: user.role as UserRoleType,
        userToken: user.token,
        expiration: 10,
      });

      token = tokenPayLoad.accessToken;
    });

    it('should reset password', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/forgot-password')
        .set('Content-Type', 'application/json')
        .send({
          identifier: user.email,
        })
        .expect(200)
        .expect(
          { message: `Password successfully reset to: ${defaultPassword}` },
          done,
        );
    });

    it('should login with new password', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          identifier: user.email,
          password: `${defaultPassword}`,
        })
        .expect(200)
        .end((error, response) => {
          if (error) {
            return done(error, response.body);
          }

          expect(response.body.data.token.accessToken).toBeDefined();
          expect(response.body.data.user.id).toBe(user.id);

          return done();
        });
    });
  });

  describe('GET /v1/auth/user', () => {
    let authUser: User;
    let jwt: string;

    beforeAll(async () => {
      const auth = await authAsRandomUser(app);

      authUser = auth.user;
      jwt = auth.jwt;
    });

    it('should throw an error when guests attempt to get auth user', (done) => {
      request(app.getHttpServer()).get('/v1/auth/user').expect(401, done);
    });

    it('should return the auth user payload', (done) => {
      request(app.getHttpServer())
        .get('/v1/auth/user')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((error, response) => {
          if (error) {
            return done(error, response.body);
          }

          expect(response.body.data.email).toBe(authUser.email);
          expect(response.body.data.phone).toBe(authUser.phone);
          expect(response.body.data.role).toBe(authUser.role);

          return done();
        });
    });
  });

  describe('POST /v1/auth/refresh', () => {
    let authUser: User;
    let jwt: string;

    beforeAll(async () => {
      const auth = await authAsRandomUser(app);

      authUser = auth.user;
      jwt = auth.jwt;
    });

    it('should throw an error when guests attempt to refresh token', (done) => {
      request(app.getHttpServer()).post('/v1/auth/refresh').expect(401, done);
    });

    it('should refresh the authenticated user access token', (done) => {
      request(app.getHttpServer())
        .post('/v1/auth/refresh')
        .set('Authorization', `Bearer ${jwt}`)
        .expect(200)
        .end((error, response) => {
          if (error) {
            return done(error, response.body);
          }

          expect(response.body.data.token.accessToken).toBeDefined();
          expect(response.body.data.user.id).toBe(authUser.id);
          expect(response.body.data.isFirstLogin).toBe(false);

          return done();
        });
    });
  });
});
