/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { INestApplication } from '@nestjs/common';
import { HttpStatus, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { middleware as expressCtx } from 'express-ctx';
import request from 'supertest';

import { AppModule } from '../../src/app.module';
import { AccountSettingsService } from '../../src/configs/account-settings/account-settings.service';
import { ApiConfigService } from '../../src/configs/api-config/api-config.service';
import { accountSettingTypes } from '../../src/constants/account-setting-types';
import { AuthenticatorService } from '../../src/domains/authenticator/authenticator.service';
import type { User } from '../../src/domains/users/user.entity';
import { AuthUserInterceptor } from '../../src/interceptors/auth-user.interceptor';
import { authAsRandomUser, createTestDatabase, removeDb } from '../setup/db';
import { closeInRedisConnection } from '../setup/redis-memory';

describe('AuthenticatorController', () => {
  let app: INestApplication;
  let jwt: string;
  let user: User;
  let settingsService: AccountSettingsService;
  let configService: ApiConfigService;

  beforeAll(async () => {
    await closeInRedisConnection();
    removeDb();

    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthenticatorService)
      .useValue({
        generateSecret: jest.fn().mockReturnValue('test-generated-string'),
        generateBarCode: jest
          .fn()
          .mockReturnValue('data:image/png;base64,iVBORw0KGgoAAAANSUh...'),
      })
      .compile();

    app = module.createNestApplication();

    app.use(expressCtx);
    app.enableVersioning({
      type: VersioningType.URI,
      prefix: 'v',
    });

    // Allows access to request user using context provider
    app.useGlobalInterceptors(new AuthUserInterceptor());

    app.useGlobalPipes(
      new ValidationPipe({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        stopAtFirstError: true,
        validationError: {
          target: false,
          value: false,
        },
      }),
    );

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.init();

    await createTestDatabase(true);

    configService = app.get<ApiConfigService>(ApiConfigService);

    const auth = await authAsRandomUser(app);

    settingsService = app.get<AccountSettingsService>(AccountSettingsService);

    jwt = auth.jwt;
    user = auth.user;
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('POST /v1/authenticator/enable', () => {
    it('should enable authenticator 2fa and returned data url for QR code', (done) => {
      request(app.getHttpServer())
        .post('/v1/authenticator/enable')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.data).toBeDefined();

          settingsService
            .getUserSetting({
              userId: user.id,
              name: accountSettingTypes.AuthenticatorSecret,
            })
            .then((setting) => {
              expect(setting).toBeDefined();
              expect(setting!.user_id).toBe(user.id);

              return done();
            })
            .catch((error) => done(error));
        });
    });
  });

  describe('POST /v1/authenticator/disable', () => {
    beforeEach(async () => {
      const setting = await settingsService.getUserSetting({
        userId: user.id,
        name: accountSettingTypes.AuthenticatorSecret,
      });

      const authenticatorService =
        app.get<AuthenticatorService>(AuthenticatorService);

      if (!setting) {
        await settingsService.create({
          user_id: user.id,
          name: accountSettingTypes.AuthenticatorSecret,
          value: authenticatorService.generateSecret(),
          data_type: 'string',
        });
      }
    });

    it('should throw an error when the user tries to disable 2fa with wrong password', (done) => {
      request(app.getHttpServer())
        .post('/v1/authenticator/disable')
        .send({ password: 'password333333' })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt}`)
        .expect(422)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          settingsService
            .getUserSetting({
              userId: user.id,
              name: accountSettingTypes.AuthenticatorSecret,
            })
            .then((setting) => {
              expect(setting).toBeDefined();

              return done();
            })
            .catch((error) => done(error));
        });
    });

    it('should disable authenticator 2fa', (done) => {
      request(app.getHttpServer())
        .post('/v1/authenticator/disable')
        .send({
          password: configService.get<string>('TMS_DEFAULT_PASSWORD'),
        })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.body.message).toBeDefined();

          settingsService
            .getUserSetting({
              userId: user.id,
              name: accountSettingTypes.AuthenticatorSecret,
            })
            .then((setting) => {
              expect(setting).toBeNull();

              return done();
            })
            .catch((error) => done(error));
        });
    });
  });

  describe('GET /v1/authenticator/status', () => {
    it('should check if the user has enabled 2fa', (done) => {
      request(app.getHttpServer())
        .get('/v1/authenticator/status')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          settingsService
            .getUserSetting({
              userId: user.id,
              name: accountSettingTypes.AuthenticatorSecret,
            })
            .then((setting) => {
              if (setting) {
                expect(res.body.data).toBe(true);
              } else {
                expect(res.body.data).toBe(false);
              }

              return done();
            })
            .catch((error) => done(error));
        });
    });
  });
});
