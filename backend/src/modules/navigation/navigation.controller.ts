import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';
import {
  NavigateRequestDto,
  StepNavigationDto,
} from '../../common/dto/navigation.dto';
import {
  NavigationStateResponse,
  VisitRecord,
} from '../../common/types/navigation.types';

@ApiTags('Navigation')
@Controller('browser')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get(':personId')
  @ApiOperation({ summary: 'Load or initialize active browser session for a persona' })
  @ApiParam({ name: 'personId', description: 'ID of the browsing persona' })
  @ApiResponse({ status: 200, description: 'Active browser session state' })
  async getSession(@Param('personId') personId: string): Promise<NavigationStateResponse> {
    return this.navigationService.getOrCreateSession(personId);
  }

  @Post(':personId/navigate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Navigate to address or search query with forward path truncation' })
  @ApiParam({ name: 'personId', description: 'ID of the browsing persona' })
  @ApiResponse({ status: 200, description: 'Updated navigation state' })
  @ApiResponse({ status: 409, description: 'Optimistic locking concurrency conflict' })
  async navigate(
    @Param('personId') personId: string,
    @Body() dto: NavigateRequestDto,
  ): Promise<NavigationStateResponse> {
    return this.navigationService.navigate(personId, dto);
  }

  @Post(':personId/back')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step backward in the navigation stack' })
  @ApiParam({ name: 'personId', description: 'ID of the browsing persona' })
  async stepBack(
    @Param('personId') personId: string,
    @Body() dto: StepNavigationDto,
  ): Promise<NavigationStateResponse> {
    return this.navigationService.stepBack(personId, dto);
  }

  @Post(':personId/forward')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step forward in the navigation stack' })
  @ApiParam({ name: 'personId', description: 'ID of the browsing persona' })
  async stepForward(
    @Param('personId') personId: string,
    @Body() dto: StepNavigationDto,
  ): Promise<NavigationStateResponse> {
    return this.navigationService.stepForward(personId, dto);
  }

  @Post(':personId/history/:entryId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Jump directly to a specific entry in the navigation stack' })
  @ApiParam({ name: 'personId', description: 'ID of the browsing persona' })
  @ApiParam({ name: 'entryId', description: 'ID of the destination entry in the session' })
  async jumpHistoryEntry(
    @Param('personId') personId: string,
    @Param('entryId') entryId: string,
    @Body() dto: StepNavigationDto,
  ): Promise<NavigationStateResponse> {
    return this.navigationService.jumpHistoryEntry(personId, entryId, dto);
  }

  @Get(':personId/history')
  @ApiOperation({ summary: 'Retrieve immutable chronological visit history' })
  @ApiParam({ name: 'personId', description: 'ID of the browsing persona' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  async getVisitHistory(
    @Param('personId') personId: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ): Promise<VisitRecord[]> {
    return this.navigationService.getVisitHistory(personId, limit ? Number(limit) : 50, skip ? Number(skip) : 0);
  }
}
