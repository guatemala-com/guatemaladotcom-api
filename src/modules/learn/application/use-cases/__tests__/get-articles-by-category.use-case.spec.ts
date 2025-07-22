/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetArticlesByCategoryUseCase } from '../get-articles-by-category.use-case';
import { LearnRepositoryImpl } from '../../../infrastructure/repositories/learn.repository';
import { LearnPost } from '../../../domain/entities/learn-post.entity';
import { LearnCategory } from '../../../domain/entities/category.entity';
import { PaginatedResult } from '../../../domain/repositories/learn.repository.interface';

describe('GetArticlesByCategoryUseCase', () => {
  let useCase: GetArticlesByCategoryUseCase;
  let learnRepository: jest.Mocked<LearnRepositoryImpl>;

  const mockCategory = LearnCategory.fromDatabase({
    id: 1,
    name: 'Travel Tips',
    slug: 'travel-tips',
    description: 'Tips for traveling in Guatemala',
    parent: 0,
    count: 5,
  });

  const mockLearnPost = LearnPost.fromDatabase({
    id: 1,
    url: 'https://guatemala.com/sample-article',
    title: 'Sample Article',
    excerpt: 'This is a sample article excerpt',
    date: '2024-01-15T10:30:00.000Z',
    images: [
      {
        original: 'https://example.com/image.jpg',
        thumbnail: 'https://example.com/thumb.jpg',
        medium: 'https://example.com/medium.jpg',
        web_gallery: 'https://example.com/gallery.jpg',
        app_medium: 'https://example.com/app.jpg',
        events_calendar_thumb: 'https://example.com/calendar.jpg',
        events_square_100: 'https://example.com/square.jpg',
        events_related: 'https://example.com/related.jpg',
        events_xl: 'https://example.com/xl.jpg',
        image_meta: {
          title: 'Sample Image',
          caption: 'Sample Caption',
        },
      },
    ],
    locationGeopoint: null,
    content: 'Article content',
    categories: [],
    author: {
      id: 1,
      name: 'Test Author',
    },
    keywords: [],
    isSponsored: 0,
    sponsor: {
      name: '',
      image_url: '',
      image: [],
      image_sidebar_url: '',
      image_sidebar: [],
      image_content_url: '',
      image_content: [],
      extra_data: '',
    },
    seo: {
      title: 'SEO Title',
      description: 'SEO Description',
      canonical: '',
      focus_keyword: '',
      seo_score: 0,
      og_title: '',
      og_description: '',
      og_image: '',
      twitter_title: '',
      twitter_description: '',
      twitter_image: '',
    },
  });

  const mockPaginatedResult: PaginatedResult<LearnPost> = {
    data: [mockLearnPost],
    total: 1,
  };

  beforeEach(async () => {
    const mockLearnRepositoryImpl = {
      getCategoryBySlug: jest.fn(),
      getArticlesByCategory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetArticlesByCategoryUseCase,
        {
          provide: LearnRepositoryImpl,
          useValue: mockLearnRepositoryImpl,
        },
      ],
    }).compile();

    useCase = module.get<GetArticlesByCategoryUseCase>(
      GetArticlesByCategoryUseCase,
    );
    learnRepository = module.get(LearnRepositoryImpl);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated articles for valid category', async () => {
      // Arrange
      const categorySlug = 'travel-tips';
      const page = 1;
      const limit = 10;

      learnRepository.getCategoryBySlug.mockResolvedValue(mockCategory);
      learnRepository.getArticlesByCategory.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      const result = await useCase.execute(categorySlug, page, limit);

      // Assert
      expect(learnRepository.getCategoryBySlug).toHaveBeenCalledWith(
        categorySlug,
      );
      expect(learnRepository.getArticlesByCategory).toHaveBeenCalledWith(
        categorySlug,
        { page, limit },
      );

      expect(result).toEqual({
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
      });
    });

    it('should return articles with null featuredImage when no images', async () => {
      // Arrange
      const postWithoutImages = LearnPost.fromDatabase({
        ...mockLearnPost,
        images: [],
      });

      const resultWithoutImages: PaginatedResult<LearnPost> = {
        data: [postWithoutImages],
        total: 1,
      };

      learnRepository.getCategoryBySlug.mockResolvedValue(mockCategory);
      learnRepository.getArticlesByCategory.mockResolvedValue(
        resultWithoutImages,
      );

      // Act
      const result = await useCase.execute('travel-tips', 1, 10);

      // Assert
      expect(result.articles[0].featuredImage).toBeNull();
    });

    it('should throw NotFoundException when category does not exist', async () => {
      // Arrange
      const categorySlug = 'non-existent-category';
      learnRepository.getCategoryBySlug.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(categorySlug, 1, 10)).rejects.toThrow(
        new NotFoundException(
          `Category with slug 'non-existent-category' not found`,
        ),
      );

      expect(learnRepository.getCategoryBySlug).toHaveBeenCalledWith(
        categorySlug,
      );
      expect(learnRepository.getArticlesByCategory).not.toHaveBeenCalled();
    });

    it('should handle pagination parameters correctly', async () => {
      // Arrange
      const categorySlug = 'travel-tips';

      learnRepository.getCategoryBySlug.mockResolvedValue(mockCategory);
      learnRepository.getArticlesByCategory.mockResolvedValue({
        data: [],
        total: 0,
      });

      // Act
      await useCase.execute(categorySlug, 2, 20);

      // Assert
      expect(learnRepository.getArticlesByCategory).toHaveBeenCalledWith(
        categorySlug,
        { page: 2, limit: 20 },
      );
    });

    it('should validate and limit page parameter', async () => {
      // Arrange
      learnRepository.getCategoryBySlug.mockResolvedValue(mockCategory);
      learnRepository.getArticlesByCategory.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      await useCase.execute('travel-tips', 0, 10); // Invalid page

      // Assert
      expect(learnRepository.getArticlesByCategory).toHaveBeenCalledWith(
        'travel-tips',
        { page: 1, limit: 10 }, // Should be corrected to 1
      );
    });

    it('should validate and limit limit parameter', async () => {
      // Arrange
      learnRepository.getCategoryBySlug.mockResolvedValue(mockCategory);
      learnRepository.getArticlesByCategory.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      await useCase.execute('travel-tips', 1, 150); // Exceeds max

      // Assert
      expect(learnRepository.getArticlesByCategory).toHaveBeenCalledWith(
        'travel-tips',
        { page: 1, limit: 100 }, // Should be limited to 100
      );
    });

    it('should calculate pagination metadata correctly', async () => {
      // Arrange
      const multiPageResult: PaginatedResult<LearnPost> = {
        data: Array<LearnPost>(10).fill(mockLearnPost),
        total: 25,
      };

      learnRepository.getCategoryBySlug.mockResolvedValue(mockCategory);
      learnRepository.getArticlesByCategory.mockResolvedValue(multiPageResult);

      // Act
      const result = await useCase.execute('travel-tips', 2, 10);

      // Assert
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('should use default pagination parameters', async () => {
      // Arrange
      learnRepository.getCategoryBySlug.mockResolvedValue(mockCategory);
      learnRepository.getArticlesByCategory.mockResolvedValue(
        mockPaginatedResult,
      );

      // Act
      await useCase.execute('travel-tips');

      // Assert
      expect(learnRepository.getArticlesByCategory).toHaveBeenCalledWith(
        'travel-tips',
        { page: 1, limit: 10 },
      );
    });

    it('should extract slug correctly from URL', async () => {
      // Arrange
      const postWithComplexUrl = LearnPost.fromDatabase({
        ...mockLearnPost,
        url: 'https://guatemala.com/category/article-with-long-slug',
      });

      const resultWithComplexUrl: PaginatedResult<LearnPost> = {
        data: [postWithComplexUrl],
        total: 1,
      };

      learnRepository.getCategoryBySlug.mockResolvedValue(mockCategory);
      learnRepository.getArticlesByCategory.mockResolvedValue(
        resultWithComplexUrl,
      );

      // Act
      const result = await useCase.execute('travel-tips', 1, 10);

      // Assert
      expect(result.articles[0].slug).toBe('article-with-long-slug');
    });
  });
});
