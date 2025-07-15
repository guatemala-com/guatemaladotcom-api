// Centralized mocks for Learn module use cases
import { CategoryResponseDto } from '../application/dtos/category.dto';

export const mockCategories: CategoryResponseDto[] = [
  {
    id: 1,
    name: 'Category 1',
    slug: 'category-1',
    description: 'Description 1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Category 2',
    slug: 'category-2',
    description: 'Description 2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
