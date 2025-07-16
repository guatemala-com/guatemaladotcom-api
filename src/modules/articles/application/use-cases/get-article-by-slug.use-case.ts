/**
 * Get Article By Slug Use Case
 *
 * This use case handles the business logic for retrieving an article by its slug.
 * It ensures the article exists and is published before returning it.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleRepositoryImpl } from '../../infrastructure/repositories/article.repository';
import { ArticleResponseDto } from '../dtos/article.dto';

@Injectable()
export class GetArticleBySlugUseCase {
  constructor(private readonly articleRepository: ArticleRepositoryImpl) {}

  async execute(slug: string): Promise<ArticleResponseDto> {
    const article = await this.articleRepository.getBySlug(slug);

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    return article.toResponse();
  }
} 