import { Injectable, NotFoundException } from '@nestjs/common';
import { LearnRepositoryImpl } from '../../infrastructure/repositories/learn.repository';
import {
  PaginatedArticlesResponseDto,
  ArticleListItemDto,
  PaginationMetaDto,
  FeaturedImageDto,
} from '../dtos/article-list.dto';

@Injectable()
export class GetArticlesByCategoryUseCase {
  constructor(private readonly learnRepository: LearnRepositoryImpl) {}

  async execute(
    categorySlug: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedArticlesResponseDto> {
    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    // First, check if the category exists
    const category = await this.learnRepository.getCategoryBySlug(categorySlug);
    if (!category) {
      throw new NotFoundException(
        `Category with slug '${categorySlug}' not found`,
      );
    }

    // Get articles by category with pagination
    const result = await this.learnRepository.getArticlesByCategory(
      categorySlug,
      {
        page: validatedPage,
        limit: validatedLimit,
      },
    );

    // Transform LearnPost entities to ArticleListItemDto
    const articles: ArticleListItemDto[] = result.data.map((post) => {
      const featuredImage: FeaturedImageDto | null =
        post.images.length > 0
          ? {
              original: post.images[0].original,
              thumbnail: post.images[0].thumbnail,
              medium: post.images[0].medium,
            }
          : null;

      return {
        id: post.id,
        slug: post.url.split('/').pop() || '', // Extract slug from URL
        title: post.title,
        excerpt: post.excerpt,
        featuredImage,
        publishedAt: post.date,
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(result.total / validatedLimit);
    const pagination: PaginationMetaDto = {
      page: validatedPage,
      limit: validatedLimit,
      total: result.total,
      totalPages,
      hasNextPage: validatedPage < totalPages,
      hasPreviousPage: validatedPage > 1,
    };

    return {
      articles,
      pagination,
    };
  }
}
