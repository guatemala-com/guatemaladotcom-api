/**
 * Article List DTOs
 *
 * Data Transfer Objects for article list endpoint responses.
 * These DTOs define the structure for listing articles by category.
 */

import { ApiProperty } from '@nestjs/swagger';

export class FeaturedImageDto {
  @ApiProperty({ description: 'Original size image URL' })
  original: string;

  @ApiProperty({ description: 'Thumbnail size image URL' })
  thumbnail: string;

  @ApiProperty({ description: 'Medium size image URL' })
  medium: string;
}

export class ArticleListItemDto {
  @ApiProperty({ description: 'Article unique identifier', example: 1234 })
  id: number;

  @ApiProperty({
    description: 'Article slug for URL',
    example: 'article-title',
  })
  slug: string;

  @ApiProperty({
    description: 'Article title',
    example: 'How to travel in Guatemala',
  })
  title: string;

  @ApiProperty({
    description: 'Article excerpt or summary',
    example: 'Discover the best places to visit in Guatemala...',
  })
  excerpt: string;

  @ApiProperty({
    description: 'Featured image in different sizes',
    type: FeaturedImageDto,
    nullable: true,
  })
  featuredImage: FeaturedImageDto | null;

  @ApiProperty({
    description: 'Article publication date in ISO format',
    example: '2024-01-15T10:30:00.000Z',
  })
  publishedAt: string;
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of articles', example: 250 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 25 })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page', example: true })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPreviousPage: boolean;
}

export class PaginatedArticlesResponseDto {
  @ApiProperty({
    description: 'List of articles in the category',
    type: [ArticleListItemDto],
  })
  articles: ArticleListItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  pagination: PaginationMetaDto;
}
