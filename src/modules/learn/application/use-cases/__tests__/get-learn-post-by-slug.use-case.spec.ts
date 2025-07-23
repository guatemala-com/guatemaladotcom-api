import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetLearnPostBySlugUseCase } from '../get-learn-post-by-slug.use-case';
import { LearnRepositoryImpl } from '../../../infrastructure/repositories/learn.repository';
import { LearnPost } from '../../../domain/entities/learn-post.entity';

describe('GetLearnPostBySlugUseCase', () => {
  let useCase: GetLearnPostBySlugUseCase;
  let learnRepository: jest.Mocked<LearnRepositoryImpl>;

  beforeEach(async () => {
    const mockLearnRepository = {
      getLearnPostBySlug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLearnPostBySlugUseCase,
        {
          provide: LearnRepositoryImpl,
          useValue: mockLearnRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetLearnPostBySlugUseCase>(GetLearnPostBySlugUseCase);
    learnRepository = module.get(LearnRepositoryImpl);
  });

  describe('execute', () => {
    it('should return learn post successfully when post exists', async () => {
      // Arrange
      const getLearnPostBySlugSpy = jest.spyOn(
        learnRepository,
        'getLearnPostBySlug',
      );
      const categorySlug = 'travel';
      const articleSlug = 'guatemala-guide';
      const mockPost = LearnPost.fromDatabase({
        id: 1,
        url: `https://example.com/${categorySlug}/${articleSlug}`,
        title: 'Guatemala Travel Guide',
        excerpt: 'Complete guide to travel in Guatemala',
        date: '2023-01-01',
        images: [
          {
            original: 'guatemala.jpg',
            thumbnail: 'guatemala-thumb.jpg',
            medium: 'guatemala-medium.jpg',
            web_gallery: 'guatemala-gallery.jpg',
            app_medium: 'guatemala-app.jpg',
            events_calendar_thumb: 'guatemala-calendar.jpg',
            events_square_100: 'guatemala-square.jpg',
            events_related: 'guatemala-related.jpg',
            events_xl: 'guatemala-xl.jpg',
            image_meta: {
              title: 'Guatemala Image',
              caption: 'Beautiful Guatemala',
            },
          },
        ],
        locationGeopoint: {
          latitude: '15.7835',
          longitude: '-90.2308',
        },
        content: 'Guatemala travel content',
        categories: [
          {
            category_id: 1,
            category_name: 'Travel',
            category_slug: categorySlug,
          },
        ],
        author: {
          name: 'Travel Writer',
          id: 1,
        },
        keywords: ['guatemala', 'travel', 'guide'],
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
          title: 'Guatemala Travel Guide - SEO',
          description: 'Best guide for traveling to Guatemala',
          canonical: `https://example.com/${categorySlug}/${articleSlug}`,
          focus_keyword: 'guatemala travel',
          seo_score: 85,
          og_title: 'Guatemala Travel Guide',
          og_description: 'Discover Guatemala with our complete guide',
          og_image: 'guatemala-og.jpg',
          twitter_title: 'Guatemala Travel Guide',
          twitter_description: 'Your guide to Guatemala',
          twitter_image: 'guatemala-twitter.jpg',
        },
      });

      getLearnPostBySlugSpy.mockResolvedValue(mockPost);

      // Act
      const result = await useCase.execute(categorySlug, articleSlug);

      // Assert
      expect(getLearnPostBySlugSpy).toHaveBeenCalledWith(
        categorySlug,
        articleSlug,
      );
      expect(getLearnPostBySlugSpy).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(1);
      expect(result.title).toBe('Guatemala Travel Guide');
      expect(result.url).toBe(
        `https://example.com/${categorySlug}/${articleSlug}`,
      );
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      const getLearnPostBySlugSpy = jest.spyOn(
        learnRepository,
        'getLearnPostBySlug',
      );
      const categorySlug = 'nonexistent-category';
      const articleSlug = 'nonexistent-article';
      getLearnPostBySlugSpy.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(categorySlug, articleSlug)).rejects.toThrow(
        new NotFoundException(
          `Article '${articleSlug}' not found in category '${categorySlug}'`,
        ),
      );
      expect(getLearnPostBySlugSpy).toHaveBeenCalledWith(
        categorySlug,
        articleSlug,
      );
      expect(getLearnPostBySlugSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      const getLearnPostBySlugSpy = jest.spyOn(
        learnRepository,
        'getLearnPostBySlug',
      );
      const categorySlug = 'travel';
      const articleSlug = 'guatemala-guide';
      const errorMessage = 'Database connection failed';
      getLearnPostBySlugSpy.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(useCase.execute(categorySlug, articleSlug)).rejects.toThrow(
        errorMessage,
      );
      expect(getLearnPostBySlugSpy).toHaveBeenCalledWith(
        categorySlug,
        articleSlug,
      );
      expect(getLearnPostBySlugSpy).toHaveBeenCalledTimes(1);
    });
  });
});
