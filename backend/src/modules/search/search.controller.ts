import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService, SearchResultsResponse } from './search.service';
import { SearchQueryDto } from '../../common/dto/navigation.dto';

@ApiTags('Search')
@Controller('sites/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search published sites by title and plain-text body content' })
  @ApiQuery({ name: 'q', example: 'marine', description: 'Query text to search' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Matched search results with snippets and scores' })
  async search(@Query() dto: SearchQueryDto): Promise<SearchResultsResponse> {
    return this.searchService.search(dto);
  }
}
