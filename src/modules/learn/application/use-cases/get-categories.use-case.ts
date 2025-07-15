import { Injectable } from '@nestjs/common';
import { LearnRepositoryImpl } from '../../infrastructure/repositories/learn.repository';
import { CategoryResponseDto } from '../dtos/category.dto';

@Injectable()
export class GetCategoriesUseCase {
  constructor(private readonly learnRepository: LearnRepositoryImpl) {}

  async execute(): Promise<CategoryResponseDto[]> {
    const categories = await this.learnRepository.getCategories();
    return categories.map((category) => category.toResponse());
  }
}
