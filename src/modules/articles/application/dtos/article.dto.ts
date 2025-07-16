/**
 * Article DTOs
 *
 * Data Transfer Objects for article-related operations.
 * These DTOs belong to the application layer.
 */

import { 
  ArticleAuthor, 
  ArticleCategory, 
  ArticleTag, 
  ArticleMedia, 
  ArticleGallery, 
  ArticleSeo, 
  ArticleAd, 
  RelatedArticle 
} from '../../domain/entities/article.entity';

export class ArticleResponseDto {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: ArticleMedia | null;
  galleries: ArticleGallery[];
  seo: ArticleSeo;
  categories: ArticleCategory[];
  tags: ArticleTag[];
  author: ArticleAuthor;
  relatedArticles: RelatedArticle[];
  ads: ArticleAd[];
  publishedAt: string;
  updatedAt: string;
  status: string;
  commentStatus: string;
  pingStatus: string;
  commentCount: number;
  viewCount?: number;
  isSticky?: boolean;
  format?: string;
} 