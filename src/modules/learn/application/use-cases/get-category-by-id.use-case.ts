import { Injectable, NotFoundException } from '@nestjs/common';
import { LearnRepositoryImpl } from '../../infrastructure/repositories/learn.repository';
import { CategoryResponseDto } from '../dtos/category.dto';

@Injectable()
export class GetCategoryByIdUseCase {
  constructor(private readonly learnRepository: LearnRepositoryImpl) {}

  async execute(id: number): Promise<CategoryResponseDto> {
    const category = await this.learnRepository.getCategoryById(id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category.toResponse();
  }
}
