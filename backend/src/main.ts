import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Next.js frontend communication
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Strict DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Wyxan Browser API')
    .setDescription('Authoritative REST backend for the Wyxan database-backed web browser system.')
    .setVersion('1.0')
    .addTag('Navigation', 'Domain state machine transitions & history')
    .addTag('Sites', 'Canonical .zz address resolution & publishing')
    .addTag('Search', 'Full-content plain text search')
    .addTag('People', 'Browsing profiles management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 Wyxan Backend running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation at: http://localhost:${port}/api`);
}

bootstrap();
