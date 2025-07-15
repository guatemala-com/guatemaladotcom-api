import { LearnCategory } from '../entities/category.entity';

export interface LearnRepository {
  getCategories(): Promise<LearnCategory[]>;
  getCategoryById(id: number): Promise<LearnCategory | null>;
}
