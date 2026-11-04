import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NavigationDestination, NavigationTransitionSource } from '../types/navigation.types';

export class DestinationDto {
  @ApiProperty({ enum: ['site', 'search'], example: 'site' })
  @IsEnum(['site', 'search'])
  type!: 'site' | 'search';

  @ApiPropertyOptional({ example: 'tidepool.zz', description: 'Canonical .zz address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'javascript', description: 'Search query string' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;
}

export class NavigateRequestDto {
  @ApiProperty({ description: 'Target destination (site or search)' })
  @ValidateNested()
  @Type(() => DestinationDto)
  @IsNotEmpty()
  destination!: DestinationDto;

  @ApiProperty({
    enum: ['typed', 'link', 'back', 'forward', 'history', 'refresh'],
    example: 'typed',
  })
  @IsEnum(['typed', 'link', 'back', 'forward', 'history', 'refresh'])
  source!: NavigationTransitionSource;

  @ApiProperty({ example: 1, description: 'Expected session version for optimistic locking' })
  @IsInt()
  @Min(0)
  expectedVersion!: number;

  @ApiPropertyOptional({ description: 'Current scroll position to preserve on the exiting entry' })
  @IsOptional()
  @IsNumber()
  currentScrollPosition?: number;

  @ApiPropertyOptional({ description: 'Optional client idempotency key to prevent double submissions' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

export class StepNavigationDto {
  @ApiProperty({ example: 1, description: 'Expected session version for optimistic locking' })
  @IsInt()
  @Min(0)
  expectedVersion!: number;

  @ApiPropertyOptional({ description: 'Current scroll position to preserve on the exiting entry' })
  @IsOptional()
  @IsNumber()
  currentScrollPosition?: number;
}

export class PublishSiteDto {
  @ApiProperty({ example: 'welcome.zz', description: 'Canonical .zz address' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: 'Welcome to Wyxan Web', description: 'Page title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: '<h1>Hello Wyxan!</h1><p>Welcome to the decentral web.</p>', description: 'HTML content' })
  @IsString()
  @IsNotEmpty()
  html!: string;

  @ApiProperty({ example: '663675f3a093a1d9426f0001', description: 'Author person ID' })
  @IsString()
  @IsNotEmpty()
  authorId!: string;
}

export class SearchQueryDto {
  @ApiProperty({ example: 'browser', description: 'Query text to search across titles and body content' })
  @IsString()
  @IsNotEmpty()
  q!: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
