import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as net from 'net';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Check if a local MongoDB instance is running on port 27017
  let memoryServer: MongoMemoryServer | null = null;
  const mongoPortOpen = await isPortOpen(27017);

  if (
    !mongoPortOpen &&
    (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost:27017'))
  ) {
    logger.log('📦 No local MongoDB daemon detected on port 27017.');
    logger.log('⚡ Launching embedded MongoDB server...');
    memoryServer = await MongoMemoryServer.create({
      instance: { port: 27017, dbName: 'wyxan' },
    });
    logger.log(`✓ Embedded MongoDB ready at: ${memoryServer.getUri()}`);
  }

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

  // Automatically seed database with personas and .zz sites
  try {
    const seedService = app.get(SeedService);
    await seedService.seed();
  } catch (seedErr) {
    logger.warn('Seed initialization notice:', seedErr);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 Wyxan Backend running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation at: http://localhost:${port}/api`);

  // Handle graceful shutdown
  const shutdown = async () => {
    logger.log('Shutting down server...');
    await app.close();
    if (memoryServer) {
      await memoryServer.stop();
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();
