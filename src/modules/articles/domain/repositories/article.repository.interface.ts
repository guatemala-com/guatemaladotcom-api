/**
 * Article Repository Interface
 *
 * Defines the contract for article data access operations.
 * This interface belongs to the domain layer.
 */

import { Article } from '../entities/article.entity';

export interface ArticleRepository {
  /**
   * Get article by ID
   * @param id - Article ID
   * @returns Promise<Article | null>
   */
  getById(id: number): Promise<Article | null>;

  /**
   * Get article by slug
   * @param slug - Article slug
   * @returns Promise<Article | null>
   */
  getBySlug(slug: string): Promise<Article | null>;

  /**
   * Get articles by category
   * @param categoryId - Category ID
   * @param limit - Maximum number of articles to return
   * @returns Promise<Article[]>
   */
  getByCategory(categoryId: number, limit?: number): Promise<Article[]>;

  /**
   * Get related articles for a given article
   * @param articleId - Article ID
   * @param limit - Maximum number of related articles to return
   * @returns Promise<Article[]>
   */
  getRelatedArticles(articleId: number, limit?: number): Promise<Article[]>;

  /**
   * Search articles by title or content
   * @param query - Search query
   * @param limit - Maximum number of articles to return
   * @returns Promise<Article[]>
   */
  search(query: string, limit?: number): Promise<Article[]>;

  /**
   * Get articles by author
   * @param authorId - Author ID
   * @param limit - Maximum number of articles to return
   * @returns Promise<Article[]>
   */
  getByAuthor(authorId: number, limit?: number): Promise<Article[]>;

  /**
   * Get articles by tag
   * @param tagId - Tag ID
   * @param limit - Maximum number of articles to return
   * @returns Promise<Article[]>
   */
  getByTag(tagId: number, limit?: number): Promise<Article[]>;

  /**
   * Get recent articles
   * @param limit - Maximum number of articles to return
   * @returns Promise<Article[]>
   */
  getRecent(limit?: number): Promise<Article[]>;

  /**
   * Get featured/sticky articles
   * @param limit - Maximum number of articles to return
   * @returns Promise<Article[]>
   */
  getFeatured(limit?: number): Promise<Article[]>;
} 