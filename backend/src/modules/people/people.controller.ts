import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PeopleService } from './people.service';
import { Person } from '../../common/types/navigation.types';

@ApiTags('People')
@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  @ApiOperation({ summary: 'List all selectable browsing personas' })
  @ApiResponse({ status: 200, description: 'List of personas' })
  async listAll(): Promise<Person[]> {
    return this.peopleService.listAll();
  }
}
