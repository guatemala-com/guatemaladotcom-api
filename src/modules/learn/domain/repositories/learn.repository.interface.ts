import { LearnCategory } from '../entities/category.entity';
import { LearnPost } from '../entities/learn-post.entity';

export interface LearnRepository {
  getCategories(): Promise<LearnCategory[]>;
  getCategoryById(id: number): Promise<LearnCategory | null>;
  getLearnPostById(id: number): Promise<LearnPost | null>;
}
