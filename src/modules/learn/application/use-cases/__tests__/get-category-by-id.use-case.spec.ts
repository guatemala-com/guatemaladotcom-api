import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetCategoryByIdUseCase } from '../get-category-by-id.use-case';
import { LearnRepositoryImpl } from '../../../infrastructure/repositories/learn.repository';
import { LearnCategory } from '../../../domain/entities/category.entity';

describe('GetCategoryByIdUseCase', () => {
  let useCase: GetCategoryByIdUseCase;
  let learnRepository: jest.Mocked<LearnRepositoryImpl>;

  beforeEach(async () => {
    const mockLearnRepository = {
      getCategoryById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoryByIdUseCase,
        {
          provide: LearnRepositoryImpl,
          useValue: mockLearnRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCategoryByIdUseCase>(GetCategoryByIdUseCase);
    learnRepository = module.get(LearnRepositoryImpl);
  });

  describe('execute', () => {
    it('should return category successfully when category exists', async () => {
      // Arrange
      const categoryId = 1;
      const mockCategory = LearnCategory.fromDatabase({
        id: categoryId,
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test Description',
        parent: 0,
        count: 5,
      });

      learnRepository.getCategoryById.mockResolvedValue(mockCategory);

      // Act
      const result = await useCase.execute(categoryId);

      // Assert
      expect(learnRepository.getCategoryById).toHaveBeenCalledWith(categoryId);
      expect(learnRepository.getCategoryById).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        id: categoryId,
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test Description',
        parent: 0,
        count: 5,
        children: [],
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      // Arrange
      const categoryId = 999;
      learnRepository.getCategoryById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(categoryId)).rejects.toThrow(
        new NotFoundException(`Category with ID ${categoryId} not found`),
      );
      expect(learnRepository.getCategoryById).toHaveBeenCalledWith(categoryId);
      expect(learnRepository.getCategoryById).toHaveBeenCalledTimes(1);
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      const categoryId = 1;
      const errorMessage = 'Database connection failed';
      learnRepository.getCategoryById.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(useCase.execute(categoryId)).rejects.toThrow(errorMessage);
      expect(learnRepository.getCategoryById).toHaveBeenCalledWith(categoryId);
      expect(learnRepository.getCategoryById).toHaveBeenCalledTimes(1);
    });
  });
}); 