/**
 * Mock LearnCategory objects for testing hierarchy building
 */
import { LearnCategory } from '../../../../domain/entities/category.entity';

/**
 * Factory function to create mock LearnCategory objects
 */
export const createMockLearnCategory = (
  id: number,
  name: string,
  slug: string,
  description: string,
  parent: number,
  count: number,
  children: LearnCategory[] = [],
): LearnCategory =>
  new LearnCategory(id, name, slug, description, parent, count, children);

/**
 * Pre-configured category hierarchies for common test scenarios
 */
export const mockFlatCategoryList: LearnCategory[] = [
  createMockLearnCategory(
    1,
    'Technology',
    'technology',
    'Tech articles',
    0,
    10,
  ),
  createMockLearnCategory(
    2,
    'Programming',
    'programming',
    'Programming articles',
    1,
    5,
  ),
  createMockLearnCategory(3, 'JavaScript', 'javascript', 'JS articles', 2, 3),
  createMockLearnCategory(4, 'Design', 'design', 'Design articles', 1, 4),
];

export const mockMultipleRootCategories: LearnCategory[] = [
  createMockLearnCategory(
    1,
    'Technology',
    'technology',
    'Tech articles',
    0,
    10,
  ),
  createMockLearnCategory(2, 'Travel', 'travel', 'Travel articles', 0, 8),
  createMockLearnCategory(
    3,
    'Programming',
    'programming',
    'Programming articles',
    1,
    5,
  ),
];

export const mockOrphanedCategories: LearnCategory[] = [
  createMockLearnCategory(
    1,
    'Technology',
    'technology',
    'Tech articles',
    0,
    10,
  ),
  createMockLearnCategory(3, 'JavaScript', 'javascript', 'JS articles', 2, 3), // Parent ID 2 doesn't exist
];

export const mockEmptyCategories: LearnCategory[] = [];
