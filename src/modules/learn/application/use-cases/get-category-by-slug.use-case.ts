import { Injectable, NotFoundException } from '@nestjs/common';
import { LearnRepositoryImpl } from '../../infrastructure/repositories/learn.repository';
import { CategoryResponseDto } from '../dtos/category.dto';

@Injectable()
export class GetCategoryBySlugUseCase {
  constructor(private readonly learnRepository: LearnRepositoryImpl) {}

  async execute(slug: string): Promise<CategoryResponseDto> {
    const category = await this.learnRepository.getCategoryBySlug(slug);

    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    return category.toResponse();
  }
}
