/**
 * Category DTOs
 *
 * Data Transfer Objects for category-related operations.
 * These DTOs belong to the application layer.
 */

export class CategoryResponseDto {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export class CategoryListResponseDto {
  success: boolean;
  data: CategoryResponseDto[];
  message: string;
  total: number;
}

export class CategoryDetailResponseDto {
  success: boolean;
  data: CategoryResponseDto;
  message: string;
}
