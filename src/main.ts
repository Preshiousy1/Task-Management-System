import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import compression from 'compression';
import { middleware as expressCtx } from 'express-ctx';
import helmet from 'helmet';
import morgan from 'morgan';

import { AppModule } from './app.module';
import { ApiConfigService } from './configs/api-config/api-config.service';
import { ConfigsModule } from './configs/configs.module';
import { AppLoggerService } from './configs/logger/app-logger.service';
import { QueryFailedFilter } from './filters/query-failed.filter';
import { HttpExceptionFilter } from './filters/validation-error.filter';
import { AuthUserInterceptor } from './interceptors/auth-user.interceptor';
import { setupSwagger } from './swagger-setup';

function registerGlobalMiddleware(app: NestExpressApplication) {
  app.use(helmet());
  app.use(compression());
  app.use(morgan('combined'));
  app.use(expressCtx);
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true, bufferLogs: true },
  );

  registerGlobalMiddleware(app);

  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),
    new QueryFailedFilter(reflector),
  );

  app.useGlobalInterceptors(
    new AuthUserInterceptor(),
  );

  const configService = app.select(ConfigsModule).get(ApiConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: false,
      enableDebugMessages: configService.isLocal,
      exceptionFactory: (errors) => {
        const errorList = Object.values(errors[0]?.constraints || {});
        const error =
          errorList.length > 0 ? errorList[0] : 'Unable to validate request';

        return new UnprocessableEntityException(error);
      },
      stopAtFirstError: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  if (configService.documentationEnabled) {
    setupSwagger(app);
  }

  app.useLogger(await app.select(ConfigsModule).resolve(AppLoggerService));

  await app.listen(configService.appConfig.port);

  console.info(`server running on ${await app.getUrl()}`);
}

void bootstrap();
