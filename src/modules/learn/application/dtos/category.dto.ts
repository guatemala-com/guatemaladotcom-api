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
  parent: number;
  count: number;
  children: CategoryResponseDto[];
}
