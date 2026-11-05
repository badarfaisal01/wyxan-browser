import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';
import { Logger } from '@nestjs/common';

async function runSeed() {
  const logger = new Logger('SeedRunner');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seedService = app.get(SeedService);
    const result = await seedService.seed();
    logger.log(`✅ Database seeding finished successfully!`, JSON.stringify(result));
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeed();

