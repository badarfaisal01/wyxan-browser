import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { PublishSiteDto } from '../../common/dto/navigation.dto';
import { Site } from '../../common/types/navigation.types';

@ApiTags('Sites')
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  @ApiOperation({ summary: 'List all published .zz web sites' })
  @ApiResponse({ status: 200, description: 'List of published sites' })
  async listAll(): Promise<Site[]> {
    return this.sitesService.listAllSites();
  }

  @Get(':address')
  @ApiOperation({ summary: 'Resolve a site by its canonical .zz address' })
  @ApiParam({ name: 'address', example: 'tidepool.zz', description: 'Address to resolve' })
  @ApiResponse({ status: 200, description: 'Resolved site metadata and sanitized HTML' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async resolve(@Param('address') address: string): Promise<Site> {
    return this.sitesService.resolveByAddress(address);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publish a new web page under a unique .zz address' })
  @ApiResponse({ status: 201, description: 'Successfully published and indexed site' })
  @ApiResponse({ status: 400, description: 'Invalid address or payload' })
  @ApiResponse({ status: 409, description: 'Address conflict / already registered' })
  async publish(@Body() dto: PublishSiteDto): Promise<Site> {
    return this.sitesService.publishSite(dto);
  }
}
