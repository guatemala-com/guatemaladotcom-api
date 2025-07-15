import { Test, TestingModule } from '@nestjs/testing';
import { LearnRepositoryImpl } from '../learn.repository';
import { PrismaService } from '../../../../prisma/infrastructure/prisma.service';
import { LearnCategory } from '../../../domain/entities/category.entity';

describe('LearnRepositoryImpl', () => {
  let repository: LearnRepositoryImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearnRepositoryImpl,
        {
          provide: PrismaService,
          useValue: {
            // Mock prisma service methods if they were used.
          },
        },
      ],
    }).compile();

    repository = module.get<LearnRepositoryImpl>(LearnRepositoryImpl);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getCategories', () => {
    it('should return an array of learn categories', async () => {
      const categories = await repository.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(2);
      expect(categories[0]).toBeInstanceOf(LearnCategory);
      expect(categories[0].name).toBe('Category 1');
      expect(categories[1].name).toBe('Category 2');
    });
  });

  describe('getCategoryById', () => {
    it('should return a learn category if found', async () => {
      const id = 1;
      const category = await repository.getCategoryById(id);
      expect(category).toBeInstanceOf(LearnCategory);
      expect(category?.id).toBe(id);
      expect(category?.name).toBe('Category 1');
    });

    it('should return null if category is not found', async () => {
      const id = 999;
      const category = await repository.getCategoryById(id);
      expect(category).toBeNull();
    });
  });
});
