import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [NavigationController],
  providers: [NavigationService],
  exports: [NavigationService],
})
export class NavigationModule {}

