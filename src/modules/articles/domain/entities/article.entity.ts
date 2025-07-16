/**
 * Article Entity
 *
 * Represents a WordPress article/post with all its associated data
 * including metadata, SEO, media, categories, tags, and related articles.
 */

import { ArticleResponseDto } from '../../application/dtos/article.dto';

export interface ArticleAuthor {
  id: number;
  name: string;
  email?: string;
  bio?: string;
  avatar?: string;
}

export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface ArticleTag {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface ArticleMedia {
  id: number;
  url: string;
  title?: string;
  alt?: string;
  caption?: string;
  description?: string;
  mimeType?: string;
  width?: number;
  height?: number;
}

export interface ArticleGallery {
  id: string;
  title?: string;
  images: ArticleMedia[];
}

export interface ArticleSeo {
  title?: string;
  description?: string;
  canonical?: string;
  focusKeyword?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  schema?: any;
}

export interface ArticleAd {
  id: string;
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  type: 'banner' | 'video' | 'native' | 'placeholder';
  content?: string;
  url?: string;
  title?: string;
  image?: string;
}

export interface RelatedArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: ArticleMedia | null;
  publishedAt: Date;
  author: ArticleAuthor;
  categories: ArticleCategory[];
}

export class Article {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly slug: string,
    public readonly excerpt: string,
    public readonly content: string,
    public readonly featuredImage: ArticleMedia | null,
    public readonly galleries: ArticleGallery[],
    public readonly seo: ArticleSeo,
    public readonly categories: ArticleCategory[],
    public readonly tags: ArticleTag[],
    public readonly author: ArticleAuthor,
    public readonly relatedArticles: RelatedArticle[],
    public readonly ads: ArticleAd[],
    public readonly publishedAt: Date,
    public readonly updatedAt: Date,
    public readonly status: string,
    public readonly commentStatus: string,
    public readonly pingStatus: string,
    public readonly commentCount: number,
    public readonly viewCount?: number,
    public readonly isSticky?: boolean,
    public readonly format?: string,
  ) {}

  toResponse(): ArticleResponseDto {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      excerpt: this.excerpt,
      content: this.content,
      featuredImage: this.featuredImage,
      galleries: this.galleries,
      seo: this.seo,
      categories: this.categories,
      tags: this.tags,
      author: this.author,
      relatedArticles: this.relatedArticles,
      ads: this.ads,
      publishedAt: this.publishedAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      status: this.status,
      commentStatus: this.commentStatus,
      pingStatus: this.pingStatus,
      commentCount: this.commentCount,
      viewCount: this.viewCount,
      isSticky: this.isSticky,
      format: this.format,
    };
  }

  static sanitizeHtmlContent(content: string): string {
    // Basic HTML sanitization - you might want to use a more robust library like DOMPurify
    return content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '') // Remove iframe tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers like onclick="..."
      .replace(/\son\w+\s*=\s*[^"'\s>]+/gi, '') // Remove event handlers without quotes
      .replace(/\son\w+\s*=\s*[^>]*/gi, ''); // Remove any remaining event handlers
  }

  get sanitizedContent(): string {
    return Article.sanitizeHtmlContent(this.content);
  }

  get readingTime(): number {
    const wordsPerMinute = 200;
    const textContent = this.content.replace(/<[^>]*>/g, '').trim();
    const words = textContent ? textContent.split(/\s+/).filter(word => word.length > 0).length : 0;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }
} 