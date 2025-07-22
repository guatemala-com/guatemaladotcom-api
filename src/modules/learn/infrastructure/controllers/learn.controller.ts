import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { OAuthAuthRead } from '../../../auth/infrastructure/decorators/oauth-scopes.decorator';
import { GetCategoriesUseCase } from '../../application/use-cases/get-categories.use-case';
import { GetCategoryByIdUseCase } from '../../application/use-cases/get-category-by-id.use-case';
import { GetCategoryBySlugUseCase } from '../../application/use-cases/get-category-by-slug.use-case';
import { GetLearnPostByIdUseCase } from '../../application/use-cases/get-learn-post-by-id.use-case';
import { CategoryResponseDto } from '../../application/dtos/category.dto';
import { LearnPostResponseDto } from '../../application/dtos/learn-post.dto';

@OAuthAuthRead()
@Controller('learn')
export class LearnController {
  constructor(
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,
    private readonly getCategoryBySlugUseCase: GetCategoryBySlugUseCase,
    private readonly getLearnPostByIdUseCase: GetLearnPostByIdUseCase,
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
}
