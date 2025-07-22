/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetArticlesByCategoryUseCase } from '../../../application/use-cases/get-articles-by-category.use-case';
import { LearnController } from '../learn.controller';
import { GetCategoriesUseCase } from '../../../application/use-cases/get-categories.use-case';
import { GetCategoryByIdUseCase } from '../../../application/use-cases/get-category-by-id.use-case';
import { GetCategoryBySlugUseCase } from '../../../application/use-cases/get-category-by-slug.use-case';
import { GetLearnPostByIdUseCase } from '../../../application/use-cases/get-learn-post-by-id.use-case';
import { PaginatedArticlesResponseDto } from '../../../application/dtos/article-list.dto';

describe('LearnController - getArticlesByCategory', () => {
  let controller: LearnController;
  let getArticlesByCategoryUseCase: jest.Mocked<GetArticlesByCategoryUseCase>;

  const mockPaginatedResponse: PaginatedArticlesResponseDto = {
    articles: [
      {
        id: 1,
        slug: 'sample-article',
        title: 'Sample Article',
        excerpt: 'This is a sample article excerpt',
        featuredImage: {
          original: 'https://example.com/image.jpg',
          thumbnail: 'https://example.com/thumb.jpg',
          medium: 'https://example.com/medium.jpg',
        },
        publishedAt: '2024-01-15T10:30:00.000Z',
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  beforeEach(async () => {
    const getArticlesByCategoryUseCaseMock = {
      execute: jest.fn().mockResolvedValue(mockPaginatedResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearnController],
      providers: [
        {
          provide: GetCategoriesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetCategoryByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetCategoryBySlugUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetLearnPostByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetArticlesByCategoryUseCase,
          useValue: getArticlesByCategoryUseCaseMock,
        },
      ],
    }).compile();

    controller = module.get<LearnController>(LearnController);
    getArticlesByCategoryUseCase = module.get(GetArticlesByCategoryUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getArticlesByCategory', () => {
    it('should return paginated articles for a category', async () => {
      // Arrange
      const slug = 'travel-tips';
      const page = '1';
      const limit = '10';

      // Act
      const result = await controller.getArticlesByCategory(slug, page, limit);

      // Assert
      expect(getArticlesByCategoryUseCase.execute).toHaveBeenCalledWith(
        slug,
        1,
        10,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should use default pagination when parameters are not provided', async () => {
      // Arrange
      const slug = 'travel-tips';

      // Act
      const result = await controller.getArticlesByCategory(slug);

      // Assert
      expect(getArticlesByCategoryUseCase.execute).toHaveBeenCalledWith(
        slug,
        1,
        10,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle custom pagination parameters', async () => {
      // Arrange
      const slug = 'travel-tips';
      const page = '2';
      const limit = '20';

      // Act
      const result = await controller.getArticlesByCategory(slug, page, limit);

      // Assert
      expect(getArticlesByCategoryUseCase.execute).toHaveBeenCalledWith(
        slug,
        2,
        20,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle invalid pagination parameters gracefully', async () => {
      // Arrange
      const slug = 'travel-tips';
      const page = 'invalid';
      const limit = 'invalid';

      // Act
      const result = await controller.getArticlesByCategory(slug, page, limit);

      // Assert
      expect(getArticlesByCategoryUseCase.execute).toHaveBeenCalledWith(
        slug,
        NaN,
        NaN,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should propagate use case exceptions', async () => {
      // Arrange
      const slug = 'non-existent-category';
      const error = new Error('Category not found');
      getArticlesByCategoryUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.getArticlesByCategory(slug, '1', '10'),
      ).rejects.toThrow(error);

      expect(getArticlesByCategoryUseCase.execute).toHaveBeenCalledWith(
        slug,
        1,
        10,
      );
    });

    it('should handle edge case pagination values', async () => {
      // Arrange
      const slug = 'travel-tips';
      const page = '0';
      const limit = '0';

      // Act
      const result = await controller.getArticlesByCategory(slug, page, limit);

      // Assert
      expect(getArticlesByCategoryUseCase.execute).toHaveBeenCalledWith(
        slug,
        0,
        0,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle large pagination values', async () => {
      // Arrange
      const slug = 'travel-tips';
      const page = '999999';
      const limit = '999999';

      // Act
      const result = await controller.getArticlesByCategory(slug, page, limit);

      // Assert
      expect(getArticlesByCategoryUseCase.execute).toHaveBeenCalledWith(
        slug,
        999999,
        999999,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });
  });
});
