import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { OAuthAuthRead } from '../../../auth/infrastructure/decorators/oauth-scopes.decorator';
import { GetCategoriesUseCase } from '../../application/use-cases/get-categories.use-case';
import { GetCategoryByIdUseCase } from '../../application/use-cases/get-category-by-id.use-case';
import { GetLearnPostByIdUseCase } from '../../application/use-cases/get-learn-post-by-id.use-case';
import { CategoryResponseDto } from '../../application/dtos/category.dto';
import { LearnPostResponseDto } from '../../application/dtos/learn-post.dto';

@OAuthAuthRead()
@Controller('learn')
export class LearnController {
  constructor(
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,
    private readonly getLearnPostByIdUseCase: GetLearnPostByIdUseCase,
  ) {}

  @Get('categories')
  async getCategories(): Promise<CategoryResponseDto[]> {
    return this.getCategoriesUseCase.execute();
  }

  @Get('categories/:id')
  async getCategoryById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryResponseDto> {
    return this.getCategoryByIdUseCase.execute(id);
  }

  @Get('article/:id')
  async getLearnPostById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LearnPostResponseDto> {
    return this.getLearnPostByIdUseCase.execute(id);
  }
}
