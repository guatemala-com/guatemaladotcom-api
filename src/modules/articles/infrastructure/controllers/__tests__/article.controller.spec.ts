/**
 * Article Controller Tests
 *
 * Unit tests for the ArticleController.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ArticleController } from '../article.controller';
import { GetArticleByIdUseCase } from '../../../application/use-cases/get-article-by-id.use-case';
import { GetArticleBySlugUseCase } from '../../../application/use-cases/get-article-by-slug.use-case';
import { 
  mockArticle, 
  mockGetArticleByIdUseCase, 
  mockGetArticleBySlugUseCase 
} from '../../../__mocks__/article.mocks';

describe('ArticleController', () => {
  let controller: ArticleController;
  let getArticleByIdUseCase: jest.Mocked<GetArticleByIdUseCase>;
  let getArticleBySlugUseCase: jest.Mocked<GetArticleBySlugUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: GetArticleByIdUseCase,
          useValue: mockGetArticleByIdUseCase,
        },
        {
          provide: GetArticleBySlugUseCase,
          useValue: mockGetArticleBySlugUseCase,
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    getArticleByIdUseCase = module.get<GetArticleByIdUseCase>(GetArticleByIdUseCase) as jest.Mocked<GetArticleByIdUseCase>;
    getArticleBySlugUseCase = module.get<GetArticleBySlugUseCase>(GetArticleBySlugUseCase) as jest.Mocked<GetArticleBySlugUseCase>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getArticle', () => {
    it('should get article by ID when identifier is numeric', async () => {
      // Arrange
      const identifier = '123';
      const expectedResponse = mockArticle.toResponse();
      getArticleByIdUseCase.execute.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getArticle(identifier);

      // Assert
      expect(getArticleByIdUseCase.execute).toHaveBeenCalledWith(123);
      expect(getArticleBySlugUseCase.execute).not.toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should get article by slug when identifier is not numeric', async () => {
      // Arrange
      const identifier = 'test-article-slug';
      const expectedResponse = mockArticle.toResponse();
      getArticleBySlugUseCase.execute.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getArticle(identifier);

      // Assert
      expect(getArticleBySlugUseCase.execute).toHaveBeenCalledWith(identifier);
      expect(getArticleByIdUseCase.execute).not.toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should handle mixed alphanumeric identifier as slug', async () => {
      // Arrange
      const identifier = 'test-123-article';
      const expectedResponse = mockArticle.toResponse();
      getArticleBySlugUseCase.execute.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getArticle(identifier);

      // Assert
      expect(getArticleBySlugUseCase.execute).toHaveBeenCalledWith(identifier);
      expect(getArticleByIdUseCase.execute).not.toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getArticleById', () => {
    it('should get article by ID', async () => {
      // Arrange
      const articleId = 123;
      const expectedResponse = mockArticle.toResponse();
      getArticleByIdUseCase.execute.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getArticleById(articleId);

      // Assert
      expect(getArticleByIdUseCase.execute).toHaveBeenCalledWith(articleId);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException when article not found', async () => {
      // Arrange
      const articleId = 999;
      const notFoundError = new NotFoundException('Article with ID 999 not found');
      getArticleByIdUseCase.execute.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.getArticleById(articleId)).rejects.toThrow(notFoundError);
      expect(getArticleByIdUseCase.execute).toHaveBeenCalledWith(articleId);
    });
  });

  describe('getArticleBySlug', () => {
    it('should get article by slug', async () => {
      // Arrange
      const slug = 'test-article-slug';
      const expectedResponse = mockArticle.toResponse();
      getArticleBySlugUseCase.execute.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getArticleBySlug(slug);

      // Assert
      expect(getArticleBySlugUseCase.execute).toHaveBeenCalledWith(slug);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw BadRequestException when slug is empty', async () => {
      // Arrange
      const slug = '';

      // Act & Assert
      await expect(controller.getArticleBySlug(slug)).rejects.toThrow(
        new BadRequestException('Slug cannot be empty'),
      );
      expect(getArticleBySlugUseCase.execute).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when slug is whitespace', async () => {
      // Arrange
      const slug = '   ';

      // Act & Assert
      await expect(controller.getArticleBySlug(slug)).rejects.toThrow(
        new BadRequestException('Slug cannot be empty'),
      );
      expect(getArticleBySlugUseCase.execute).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when article not found', async () => {
      // Arrange
      const slug = 'non-existent-slug';
      const notFoundError = new NotFoundException('Article with slug "non-existent-slug" not found');
      getArticleBySlugUseCase.execute.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(controller.getArticleBySlug(slug)).rejects.toThrow(notFoundError);
      expect(getArticleBySlugUseCase.execute).toHaveBeenCalledWith(slug);
    });
  });
}); 