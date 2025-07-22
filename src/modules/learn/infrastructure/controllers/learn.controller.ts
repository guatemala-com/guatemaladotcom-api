import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { OAuthAuthRead } from '../../../auth/infrastructure/decorators/oauth-scopes.decorator';
import { GetCategoriesUseCase } from '../../application/use-cases/get-categories.use-case';
import { GetCategoryByIdUseCase } from '../../application/use-cases/get-category-by-id.use-case';
import { GetCategoryBySlugUseCase } from '../../application/use-cases/get-category-by-slug.use-case';
import { GetLearnPostByIdUseCase } from '../../application/use-cases/get-learn-post-by-id.use-case';
import { GetArticlesByCategoryUseCase } from '../../application/use-cases/get-articles-by-category.use-case';
import { CategoryResponseDto } from '../../application/dtos/category.dto';
import { LearnPostResponseDto } from '../../application/dtos/learn-post.dto';
import { PaginatedArticlesResponseDto } from '../../application/dtos/article-list.dto';

@ApiTags('learn')
@ApiBearerAuth()
@OAuthAuthRead()
@Controller('learn')
export class LearnController {
  constructor(
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,
    private readonly getCategoryBySlugUseCase: GetCategoryBySlugUseCase,
    private readonly getLearnPostByIdUseCase: GetLearnPostByIdUseCase,
    private readonly getArticlesByCategoryUseCase: GetArticlesByCategoryUseCase,
  ) {}

  @Get('categories')
  async getCategories(): Promise<CategoryResponseDto[]> {
    return this.getCategoriesUseCase.execute();
  }

  @Get('categories/:slug')
  async getCategoryBySlug(
    @Param('slug') slug: string,
  ): Promise<CategoryResponseDto> {
    // If the parameter is numeric, redirect to getCategoryById
    if (/^\d+$/.test(slug)) {
      return this.getCategoryByIdUseCase.execute(parseInt(slug, 10));
    }
    return this.getCategoryBySlugUseCase.execute(slug);
  }

  @Get('article/:id')
  async getLearnPostById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LearnPostResponseDto> {
    return this.getLearnPostByIdUseCase.execute(id);
  }

  @Get('categories/:slug/articles')
  @ApiOperation({
    summary: 'Get articles by category',
    description:
      'Retrieve a paginated list of published articles belonging to a specific category',
  })
  @ApiParam({
    name: 'slug',
    description: 'Category slug identifier',
    example: 'travel-tips',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of articles per page (max 100)',
    required: false,
    example: 10,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved articles',
    type: PaginatedArticlesResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: "Category with slug 'invalid-slug' not found",
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid pagination parameters',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid pagination parameters' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async getArticlesByCategory(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedArticlesResponseDto> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    return this.getArticlesByCategoryUseCase.execute(
      slug,
      pageNumber,
      limitNumber,
    );
  }
}
