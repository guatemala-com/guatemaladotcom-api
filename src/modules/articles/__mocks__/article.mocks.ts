/**
 * Article Mocks
 *
 * Mock data and objects for testing article-related functionality.
 */

import { 
  Article, 
  ArticleAuthor, 
  ArticleCategory, 
  ArticleTag, 
  ArticleMedia, 
  ArticleGallery, 
  ArticleSeo, 
  ArticleAd 
} from '../domain/entities/article.entity';

export const mockArticleAuthor: ArticleAuthor = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  bio: 'Test author biography',
  avatar: 'https://example.com/avatar.jpg',
};

export const mockArticleCategory: ArticleCategory = {
  id: 1,
  name: 'Technology',
  slug: 'technology',
  description: 'Articles about technology',
};

export const mockArticleTag: ArticleTag = {
  id: 1,
  name: 'JavaScript',
  slug: 'javascript',
  description: 'JavaScript related articles',
};

export const mockArticleMedia: ArticleMedia = {
  id: 1,
  url: 'https://example.com/featured-image.jpg',
  title: 'Featured Image',
  alt: 'Featured image alt text',
  caption: 'Image caption',
  description: 'Image description',
  mimeType: 'image/jpeg',
  width: 800,
  height: 600,
};

export const mockArticleGallery: ArticleGallery = {
  id: 'gallery-1',
  title: 'Article Gallery',
  images: [mockArticleMedia],
};

export const mockArticleSeo: ArticleSeo = {
  title: 'SEO Title',
  description: 'SEO Description',
  canonical: 'https://example.com/article',
  focusKeyword: 'test',
  metaKeywords: 'test, article, mock',
  ogTitle: 'OG Title',
  ogDescription: 'OG Description',
  ogImage: 'https://example.com/og-image.jpg',
  twitterTitle: 'Twitter Title',
  twitterDescription: 'Twitter Description',
  twitterImage: 'https://example.com/twitter-image.jpg',
  schema: { '@type': 'Article' },
};

export const mockArticleAd: ArticleAd = {
  id: 'ad-1',
  position: 'top',
  type: 'banner',
  content: 'Ad content',
  url: 'https://example.com/ad',
  title: 'Ad Title',
  image: 'https://example.com/ad-image.jpg',
};

export const mockArticle: Article = new Article(
  1,
  'Test Article Title',
  'test-article-slug',
  'Test article excerpt',
  '<p>Test article content</p>',
  mockArticleMedia,
  [mockArticleGallery],
  mockArticleSeo,
  [mockArticleCategory],
  [mockArticleTag],
  mockArticleAuthor,
  [],
  [mockArticleAd],
  new Date('2023-01-01T00:00:00Z'),
  new Date('2023-01-01T00:00:00Z'),
  'publish',
  'open',
  'open',
  0,
  100,
  false,
  'standard',
);

export const mockArticleRepositoryImpl = {
  getById: jest.fn(),
  getBySlug: jest.fn(),
  getByCategory: jest.fn(),
  getRelatedArticles: jest.fn(),
  search: jest.fn(),
  getByAuthor: jest.fn(),
  getByTag: jest.fn(),
  getRecent: jest.fn(),
  getFeatured: jest.fn(),
};

export const mockGetArticleByIdUseCase = {
  execute: jest.fn(),
};

export const mockGetArticleBySlugUseCase = {
  execute: jest.fn(),
};

export const mockPrismaService = {
  aprPosts: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
}; 