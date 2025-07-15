import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Serve files from /public
  app.useStaticAssets(join(process.cwd(), 'public'));

  if (process.env.NODE_ENV === 'production') {
    app.use(
      ['/api-docs', '/api-docs-json'],
      basicAuth({
        users: { admin: process.env.SWAGGER_PWD },
        challenge: true,
      }),
    );
  }

  const config = new DocumentBuilder()
    .setTitle('eMali Estates API')
    .setDescription('REST endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();
