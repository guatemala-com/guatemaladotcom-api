import { LearnCategory } from '../entities/category.entity';
import { LearnPost } from '../entities/learn-post.entity';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface LearnRepository {
  getCategories(): Promise<LearnCategory[]>;
  getCategoryById(id: number): Promise<LearnCategory | null>;
  getCategoryBySlug(slug: string): Promise<LearnCategory | null>;
  getLearnPostById(id: number): Promise<LearnPost | null>;
  getArticlesByCategory(
    categorySlug: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<LearnPost>>;
}
