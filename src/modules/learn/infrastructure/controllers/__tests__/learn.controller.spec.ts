import { Test, TestingModule } from '@nestjs/testing';
import { LearnController } from '../learn.controller';
import { GetCategoriesUseCase } from '../../../application/use-cases/get-categories.use-case';
import { GetCategoryByIdUseCase } from '../../../application/use-cases/get-category-by-id.use-case';
import { GetCategoryBySlugUseCase } from '../../../application/use-cases/get-category-by-slug.use-case';
import { GetLearnPostByIdUseCase } from '../../../application/use-cases/get-learn-post-by-id.use-case';
import { GetLearnPostBySlugUseCase } from '../../../application/use-cases/get-learn-post-by-slug.use-case';
import { GetArticlesByCategoryUseCase } from '../../../application/use-cases/get-articles-by-category.use-case';
import {
  mockCategories,
  mockLearnPost,
} from '../../../__mocks__/use-cases.mocks';

describe('LearnController', () => {
  let controller: LearnController;
  let getCategoriesUseCaseExecuteMock: jest.Mock;
  let getCategoryByIdUseCaseExecuteMock: jest.Mock;
  let getCategoryBySlugUseCaseExecuteMock: jest.Mock;
  let getLearnPostByIdUseCaseExecuteMock: jest.Mock;
  let getLearnPostBySlugUseCaseExecuteMock: jest.Mock;
  let getArticlesByCategoryUseCaseExecuteMock: jest.Mock;

  beforeEach(async () => {
    getCategoriesUseCaseExecuteMock = jest
      .fn()
      .mockResolvedValue(mockCategories);
    getCategoryByIdUseCaseExecuteMock = jest
      .fn()
      .mockImplementation((id: number) =>
        Promise.resolve(mockCategories.find((cat) => cat.id === id)),
      );
    getCategoryBySlugUseCaseExecuteMock = jest
      .fn()
      .mockImplementation((slug: string) =>
        Promise.resolve(mockCategories.find((cat) => cat.slug === slug)),
      );
    getLearnPostByIdUseCaseExecuteMock = jest
      .fn()
      .mockResolvedValue(mockLearnPost);
    getLearnPostBySlugUseCaseExecuteMock = jest
      .fn()
      .mockResolvedValue(mockLearnPost);
    getArticlesByCategoryUseCaseExecuteMock = jest
      .fn()
      .mockResolvedValue({
        articles: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearnController],
      providers: [
        {
          provide: GetCategoriesUseCase,
          useValue: {
            execute: getCategoriesUseCaseExecuteMock,
          },
        },
        {
          provide: GetCategoryByIdUseCase,
          useValue: {
            execute: getCategoryByIdUseCaseExecuteMock,
          },
        },
        {
          provide: GetCategoryBySlugUseCase,
          useValue: {
            execute: getCategoryBySlugUseCaseExecuteMock,
          },
        },
        {
          provide: GetLearnPostByIdUseCase,
          useValue: {
            execute: getLearnPostByIdUseCaseExecuteMock,
          },
        },
        {
          provide: GetLearnPostBySlugUseCase,
          useValue: {
            execute: getLearnPostBySlugUseCaseExecuteMock,
          },
        },
        {
          provide: GetArticlesByCategoryUseCase,
          useValue: {
            execute: getArticlesByCategoryUseCaseExecuteMock,
          },
        },
      ],
    }).compile();

    controller = module.get<LearnController>(LearnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCategories', () => {
    it('should return an array of category DTOs', async () => {
      const result = await controller.getCategories();
      expect(result).toEqual(mockCategories);
      expect(getCategoriesUseCaseExecuteMock).toHaveBeenCalled();
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return a category DTO if found by slug', async () => {
      getCategoryBySlugUseCaseExecuteMock.mockResolvedValue(mockCategories[0]);
      const result = await controller.getCategoryBySlug('technology');
      expect(result).toEqual(mockCategories[0]);
      expect(getCategoryBySlugUseCaseExecuteMock).toHaveBeenCalledWith(
        'technology',
      );
    });

    it('should return a category DTO if found by numeric ID (backward compatibility)', async () => {
      getCategoryByIdUseCaseExecuteMock.mockResolvedValue(mockCategories[0]);
      const result = await controller.getCategoryBySlug('1');
      expect(result).toEqual(mockCategories[0]);
      expect(getCategoryByIdUseCaseExecuteMock).toHaveBeenCalledWith(1);
    });

    it('should return undefined if category is not found by slug', async () => {
      getCategoryBySlugUseCaseExecuteMock.mockResolvedValue(undefined);
      const result = await controller.getCategoryBySlug('non-existent-slug');
      expect(result).toBeUndefined();
      expect(getCategoryBySlugUseCaseExecuteMock).toHaveBeenCalledWith(
        'non-existent-slug',
      );
    });
  });

  describe('getLearnPostById', () => {
    it('should return a learn post DTO if found', async () => {
      const result = await controller.getLearnPostById(1);
      expect(result).toEqual(mockLearnPost);
      expect(getLearnPostByIdUseCaseExecuteMock).toHaveBeenCalledWith(1);
    });
  });
});
