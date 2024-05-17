/* eslint-disable unicorn/no-object-as-default-parameter */

import { HttpStatus, ValidationPipe, VersioningType } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { middleware as expressCtx } from 'express-ctx';

import { AppModule } from '../../src/app.module';
import { AuthUserInterceptor } from '../../src/interceptors/auth-user.interceptor';
import { createTestDatabase, removeDb } from './db';
import { rootRedisTestModule } from './redis-memory';
interface IConfigType {
  testModule?: TestingModule;
}

export const setupApplication = async (
  seedDb = false,
  config: IConfigType = {},
) => {
  removeDb();

  const imports = [rootRedisTestModule(), AppModule];

  const module =
    config.testModule ||
    (await Test.createTestingModule({
      imports,
    }).compile());

  const app = module.createNestApplication();

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

  await createTestDatabase(seedDb);

  await app.init();

  return app;
};
