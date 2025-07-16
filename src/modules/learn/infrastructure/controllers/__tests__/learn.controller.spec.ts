import { Test, TestingModule } from '@nestjs/testing';
import { LearnController } from '../learn.controller';
import { GetCategoriesUseCase } from '../../../application/use-cases/get-categories.use-case';
import { GetCategoryByIdUseCase } from '../../../application/use-cases/get-category-by-id.use-case';
import { GetLearnPostByIdUseCase } from '../../../application/use-cases/get-learn-post-by-id.use-case';
import { mockCategories, mockLearnPost } from '../../../__mocks__/use-cases.mocks';

describe('LearnController', () => {
  let controller: LearnController;
  let getCategoriesUseCaseExecuteMock: jest.Mock;
  let getCategoryByIdUseCaseExecuteMock: jest.Mock;
  let getLearnPostByIdUseCaseExecuteMock: jest.Mock;

  beforeEach(async () => {
    getCategoriesUseCaseExecuteMock = jest
      .fn()
      .mockResolvedValue(mockCategories);
    getCategoryByIdUseCaseExecuteMock = jest
      .fn()
      .mockImplementation((id: number) =>
        Promise.resolve(mockCategories.find((cat) => cat.id === id)),
      );
    getLearnPostByIdUseCaseExecuteMock = jest
      .fn()
      .mockResolvedValue(mockLearnPost);

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
          provide: GetLearnPostByIdUseCase,
          useValue: {
            execute: getLearnPostByIdUseCaseExecuteMock,
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

  describe('getCategoryById', () => {
    it('should return a category DTO if found', async () => {
      const result = await controller.getCategoryById(1);
      expect(result).toEqual(mockCategories[0]);
      expect(getCategoryByIdUseCaseExecuteMock).toHaveBeenCalledWith(1);
    });

    it('should return undefined if category is not found', async () => {
      const result = await controller.getCategoryById(999);
      expect(result).toBeUndefined();
      expect(getCategoryByIdUseCaseExecuteMock).toHaveBeenCalledWith(999);
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
