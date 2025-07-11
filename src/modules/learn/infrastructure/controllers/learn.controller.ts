import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { OAuthAuthRead } from '../../../auth/infrastructure/decorators/oauth-scopes.decorator';
import { GetCategoriesUseCase } from '../../application/use-cases/get-categories.use-case';
import { GetCategoryByIdUseCase } from '../../application/use-cases/get-category-by-id.use-case';
import {
  CategoryListResponseDto,
  CategoryDetailResponseDto,
} from '../../application/dtos/category.dto';

@OAuthAuthRead()
@Controller('learn')
export class LearnController {
  constructor(
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,
  ) {}

  @Get('categories')
  async getCategories(): Promise<CategoryListResponseDto> {
    const categories = await this.getCategoriesUseCase.execute();

    return {
      success: true,
      data: categories,
      message: 'Categories retrieved successfully',
      total: categories.length,
    };
  }

  @Get('categories/:id')
  async getCategoryById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryDetailResponseDto> {
    const category = await this.getCategoryByIdUseCase.execute(id);

    return {
      success: true,
      data: category,
      message: 'Category retrieved successfully',
    };
  }
}
