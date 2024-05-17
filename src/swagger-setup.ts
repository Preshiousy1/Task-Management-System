import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication) => {
  const builder = new DocumentBuilder()
    .setTitle('Task Management System API documentation')
    .setDescription('Task Management System API docs description')
    .addBearerAuth();

  if (process.env.API_VERSION) {
    builder.setVersion(process.env.API_VERSION);
  }

  const document = SwaggerModule.createDocument(app, builder.build());
  SwaggerModule.setup('documentation', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};
