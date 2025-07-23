import { Test, TestingModule } from '@nestjs/testing';
import { GetCategoriesUseCase } from '../get-categories.use-case';
import { LearnRepositoryImpl } from '../../../infrastructure/repositories/learn.repository';
import { LearnCategory } from '../../../domain/entities/category.entity';

describe('GetCategoriesUseCase', () => {
  let useCase: GetCategoriesUseCase;
  let learnRepository: jest.Mocked<LearnRepositoryImpl>;

  beforeEach(async () => {
    const mockLearnRepository = {
      getCategories: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoriesUseCase,
        {
          provide: LearnRepositoryImpl,
          useValue: mockLearnRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCategoriesUseCase>(GetCategoriesUseCase);
    learnRepository = module.get(LearnRepositoryImpl);
  });

  describe('execute', () => {
    it('should return categories successfully', async () => {
      // Arrange
      const mockCategories = [
        LearnCategory.fromDatabase({
          id: 1,
          name: 'Category 1',
          slug: 'category-1',
          description: 'Description 1',
          parent: 0,
          count: 5,
        }),
        LearnCategory.fromDatabase({
          id: 2,
          name: 'Category 2',
          slug: 'category-2',
          description: 'Description 2',
          parent: 1,
          count: 3,
        }),
      ];

      learnRepository.getCategories.mockResolvedValue(mockCategories);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(learnRepository.getCategories).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: 'Category 1',
        slug: 'category-1',
        description: 'Description 1',
        parent: 0,
        count: 5,
        children: [],
      });
      expect(result[1]).toEqual({
        id: 2,
        name: 'Category 2',
        slug: 'category-2',
        description: 'Description 2',
        parent: 1,
        count: 3,
        children: [],
      });
    });

    it('should return empty array when no categories exist', async () => {
      // Arrange
      learnRepository.getCategories.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(learnRepository.getCategories).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      learnRepository.getCategories.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(errorMessage);
      expect(learnRepository.getCategories).toHaveBeenCalledTimes(1);
    });
  });
}); 