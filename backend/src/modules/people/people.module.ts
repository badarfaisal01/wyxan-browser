import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PeopleController],
  providers: [PeopleService],
  exports: [PeopleService],
})
export class PeopleModule {}
