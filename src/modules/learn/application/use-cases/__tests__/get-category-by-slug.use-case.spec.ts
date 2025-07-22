import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetCategoryBySlugUseCase } from '../get-category-by-slug.use-case';
import { LearnRepositoryImpl } from '../../../infrastructure/repositories/learn.repository';
import { LearnCategory } from '../../../domain/entities/category.entity';

// Mock repository
const mockLearnRepository = {
  getCategories: jest.fn(),
  getCategoryById: jest.fn(),
  getCategoryBySlug: jest.fn(),
  getLearnPostById: jest.fn(),
};

describe('GetCategoryBySlugUseCase', () => {
  let useCase: GetCategoryBySlugUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoryBySlugUseCase,
        {
          provide: LearnRepositoryImpl,
          useValue: mockLearnRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCategoryBySlugUseCase>(GetCategoryBySlugUseCase);
  });

  describe('execute', () => {
    const mockCategory = LearnCategory.fromDatabase({
      id: 1,
      name: 'Technology',
      slug: 'technology',
      description: 'Technology related articles',
      parent: 0,
      count: 15,
    });

    it('should return category when found by slug', async () => {
      // Arrange
      mockLearnRepository.getCategoryBySlug.mockResolvedValue(mockCategory);

      // Act
      const result = await useCase.execute('technology');

      // Assert
      expect(mockLearnRepository.getCategoryBySlug).toHaveBeenCalledWith(
        'technology',
      );
      expect(result).toEqual({
        id: 1,
        name: 'Technology',
        slug: 'technology',
        description: 'Technology related articles',
        parent: 0,
        count: 15,
        children: [],
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      mockLearnRepository.getCategoryBySlug.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('non-existent-slug')).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute('non-existent-slug')).rejects.toThrow(
        "Category with slug 'non-existent-slug' not found",
      );
      expect(mockLearnRepository.getCategoryBySlug).toHaveBeenCalledWith(
        'non-existent-slug',
      );
    });

    it('should handle empty string slug', async () => {
      // Arrange
      mockLearnRepository.getCategoryBySlug.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('')).rejects.toThrow(NotFoundException);
      await expect(useCase.execute('')).rejects.toThrow(
        "Category with slug '' not found",
      );
      expect(mockLearnRepository.getCategoryBySlug).toHaveBeenCalledWith('');
    });

    it('should handle slug with special characters', async () => {
      // Arrange
      const specialSlugCategory = LearnCategory.fromDatabase({
        id: 2,
        name: 'Special Category',
        slug: 'special-category-2023',
        description: 'Category with special characters',
        parent: 0,
        count: 5,
      });
      mockLearnRepository.getCategoryBySlug.mockResolvedValue(
        specialSlugCategory,
      );

      // Act
      const result = await useCase.execute('special-category-2023');

      // Assert
      expect(mockLearnRepository.getCategoryBySlug).toHaveBeenCalledWith(
        'special-category-2023',
      );
      expect(result).toEqual({
        id: 2,
        name: 'Special Category',
        slug: 'special-category-2023',
        description: 'Category with special characters',
        parent: 0,
        count: 5,
        children: [],
      });
    });

    it('should handle category with children', async () => {
      // Arrange
      const childCategory = LearnCategory.fromDatabase({
        id: 2,
        name: 'Programming',
        slug: 'programming',
        description: 'Programming tutorials',
        parent: 1,
        count: 8,
      });

      const parentCategory = new LearnCategory(
        1,
        'Technology',
        'technology',
        'Technology related articles',
        0,
        15,
        [childCategory],
      );
      mockLearnRepository.getCategoryBySlug.mockResolvedValue(parentCategory);

      // Act
      const result = await useCase.execute('technology');

      // Assert
      expect(mockLearnRepository.getCategoryBySlug).toHaveBeenCalledWith(
        'technology',
      );
      expect(result).toEqual({
        id: 1,
        name: 'Technology',
        slug: 'technology',
        description: 'Technology related articles',
        parent: 0,
        count: 15,
        children: [
          {
            id: 2,
            name: 'Programming',
            slug: 'programming',
            description: 'Programming tutorials',
            parent: 1,
            count: 8,
            children: [],
          },
        ],
      });
    });

    it('should handle repository errors', async () => {
      // Arrange
      mockLearnRepository.getCategoryBySlug.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert
      await expect(useCase.execute('technology')).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockLearnRepository.getCategoryBySlug).toHaveBeenCalledWith(
        'technology',
      );
    });

    it('should return correct response structure', async () => {
      // Arrange
      mockLearnRepository.getCategoryBySlug.mockResolvedValue(mockCategory);

      // Act
      const result = await useCase.execute('technology');

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('parent');
      expect(result).toHaveProperty('count');
      expect(result).toHaveProperty('children');
      expect(typeof result.id).toBe('number');
      expect(typeof result.name).toBe('string');
      expect(typeof result.slug).toBe('string');
      expect(typeof result.description).toBe('string');
      expect(typeof result.parent).toBe('number');
      expect(typeof result.count).toBe('number');
      expect(Array.isArray(result.children)).toBe(true);
    });

    it('should call repository method only once', async () => {
      // Arrange
      mockLearnRepository.getCategoryBySlug.mockResolvedValue(mockCategory);

      // Act
      await useCase.execute('technology');

      // Assert
      expect(mockLearnRepository.getCategoryBySlug).toHaveBeenCalledTimes(1);
    });
  });
});
