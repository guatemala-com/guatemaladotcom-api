import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetLearnPostByIdUseCase } from '../get-learn-post-by-id.use-case';
import { LearnRepositoryImpl } from '../../../infrastructure/repositories/learn.repository';
import { LearnPost } from '../../../domain/entities/learn-post.entity';

describe('GetLearnPostByIdUseCase', () => {
  let useCase: GetLearnPostByIdUseCase;
  let learnRepository: jest.Mocked<LearnRepositoryImpl>;

  beforeEach(async () => {
    const mockLearnRepository = {
      getLearnPostById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLearnPostByIdUseCase,
        {
          provide: LearnRepositoryImpl,
          useValue: mockLearnRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetLearnPostByIdUseCase>(GetLearnPostByIdUseCase);
    learnRepository = module.get(LearnRepositoryImpl);
  });

  describe('execute', () => {
    it('should return learn post successfully when post exists', async () => {
      // Arrange
      const postId = 1;
      const mockPost = LearnPost.fromDatabase({
        id: postId,
        url: 'https://example.com/test-post',
        title: 'Test Post',
        excerpt: 'Test excerpt',
        date: '2023-01-01',
        images: [{
          original: 'test.jpg',
          thumbnail: 'test-thumb.jpg',
          medium: 'test-medium.jpg',
          web_gallery: 'test-gallery.jpg',
          app_medium: 'test-app.jpg',
          events_calendar_thumb: 'test-calendar.jpg',
          events_square_100: 'test-square.jpg',
          events_related: 'test-related.jpg',
          events_xl: 'test-xl.jpg',
          image_meta: {
            title: 'Test Image',
            caption: 'Test Caption',
          },
        }],
        locationGeopoint: {
          latitude: '14.6349',
          longitude: '-90.5069',
        },
        content: 'Test content',
        categories: [{
          category_id: 1,
          category_name: 'Test Category',
          category_slug: 'test-category',
        }],
        author: {
          name: 'Test Author',
          id: 1,
        },
        keywords: ['test', 'post'],
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
          title: 'Test SEO Title',
          description: 'Test SEO Description',
          canonical: 'https://example.com/test-post',
          focus_keyword: 'test',
          seo_score: 75,
          og_title: 'Test OG Title',
          og_description: 'Test OG Description',
          og_image: 'test-og.jpg',
          twitter_title: 'Test Twitter Title',
          twitter_description: 'Test Twitter Description',
          twitter_image: 'test-twitter.jpg',
        },
      });

      learnRepository.getLearnPostById.mockResolvedValue(mockPost);

      // Act
      const result = await useCase.execute(postId);

      // Assert
      expect(learnRepository.getLearnPostById).toHaveBeenCalledWith(postId);
      expect(learnRepository.getLearnPostById).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(postId);
      expect(result.title).toBe('Test Post');
      expect(result.url).toBe('https://example.com/test-post');
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      const postId = 999;
      learnRepository.getLearnPostById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(postId)).rejects.toThrow(
        new NotFoundException(`Learn post with ID ${postId} not found`),
      );
      expect(learnRepository.getLearnPostById).toHaveBeenCalledWith(postId);
      expect(learnRepository.getLearnPostById).toHaveBeenCalledTimes(1);
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      const postId = 1;
      const errorMessage = 'Database connection failed';
      learnRepository.getLearnPostById.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(useCase.execute(postId)).rejects.toThrow(errorMessage);
      expect(learnRepository.getLearnPostById).toHaveBeenCalledWith(postId);
      expect(learnRepository.getLearnPostById).toHaveBeenCalledTimes(1);
    });
  });
}); 