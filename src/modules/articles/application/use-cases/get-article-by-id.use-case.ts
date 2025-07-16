/**
 * Get Article By ID Use Case
 *
 * This use case handles the business logic for retrieving an article by its ID.
 * It ensures the article exists and is published before returning it.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleRepositoryImpl } from '../../infrastructure/repositories/article.repository';
import { ArticleResponseDto } from '../dtos/article.dto';

@Injectable()
export class GetArticleByIdUseCase {
  constructor(private readonly articleRepository: ArticleRepositoryImpl) {}

  async execute(id: number): Promise<ArticleResponseDto> {
    const article = await this.articleRepository.getById(id);

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return article.toResponse();
  }
} 