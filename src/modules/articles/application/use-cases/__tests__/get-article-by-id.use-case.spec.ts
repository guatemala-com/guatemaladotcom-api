/**
 * Get Article By ID Use Case Tests
 *
 * Unit tests for the GetArticleByIdUseCase.
 */

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetArticleByIdUseCase } from '../get-article-by-id.use-case';
import { ArticleRepositoryImpl } from '../../../infrastructure/repositories/article.repository';
import { mockArticle, mockArticleRepositoryImpl } from '../../../__mocks__/article.mocks';

describe('GetArticleByIdUseCase', () => {
  let useCase: GetArticleByIdUseCase;
  let articleRepository: jest.Mocked<ArticleRepositoryImpl>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetArticleByIdUseCase,
        {
          provide: ArticleRepositoryImpl,
          useValue: mockArticleRepositoryImpl,
        },
      ],
    }).compile();

    useCase = module.get<GetArticleByIdUseCase>(GetArticleByIdUseCase);
    articleRepository = module.get<ArticleRepositoryImpl>(ArticleRepositoryImpl) as jest.Mocked<ArticleRepositoryImpl>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return article when found', async () => {
      // Arrange
      const articleId = 1;
      articleRepository.getById.mockResolvedValue(mockArticle);

      // Act
      const result = await useCase.execute(articleId);

      // Assert
      expect(articleRepository.getById).toHaveBeenCalledWith(articleId);
      expect(result).toEqual(mockArticle.toResponse());
    });

    it('should throw NotFoundException when article not found', async () => {
      // Arrange
      const articleId = 999;
      articleRepository.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(articleId)).rejects.toThrow(
        new NotFoundException(`Article with ID ${articleId} not found`),
      );
      expect(articleRepository.getById).toHaveBeenCalledWith(articleId);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const articleId = 1;
      const repositoryError = new Error('Database connection failed');
      articleRepository.getById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(articleId)).rejects.toThrow(repositoryError);
      expect(articleRepository.getById).toHaveBeenCalledWith(articleId);
    });
  });
}); 