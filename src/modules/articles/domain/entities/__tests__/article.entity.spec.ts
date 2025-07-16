/**
 * Article Entity Tests
 *
 * Unit tests for the Article entity.
 */

import { Article } from '../article.entity';
import { 
  mockArticle, 
  mockArticleAuthor, 
  mockArticleCategory, 
  mockArticleTag, 
  mockArticleMedia, 
  mockArticleGallery, 
  mockArticleSeo, 
  mockArticleAd 
} from '../../../__mocks__/article.mocks';

describe('Article Entity', () => {
  describe('constructor', () => {
    it('should create an article with all properties', () => {
      const article = new Article(
        1,
        'Test Title',
        'test-slug',
        'Test excerpt',
        '<p>Test content</p>',
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

      expect(article.id).toBe(1);
      expect(article.title).toBe('Test Title');
      expect(article.slug).toBe('test-slug');
      expect(article.excerpt).toBe('Test excerpt');
      expect(article.content).toBe('<p>Test content</p>');
      expect(article.featuredImage).toBe(mockArticleMedia);
      expect(article.galleries).toEqual([mockArticleGallery]);
      expect(article.seo).toBe(mockArticleSeo);
      expect(article.categories).toEqual([mockArticleCategory]);
      expect(article.tags).toEqual([mockArticleTag]);
      expect(article.author).toBe(mockArticleAuthor);
      expect(article.relatedArticles).toEqual([]);
      expect(article.ads).toEqual([mockArticleAd]);
      expect(article.status).toBe('publish');
      expect(article.commentStatus).toBe('open');
      expect(article.pingStatus).toBe('open');
      expect(article.commentCount).toBe(0);
      expect(article.viewCount).toBe(100);
      expect(article.isSticky).toBe(false);
      expect(article.format).toBe('standard');
    });
  });

  describe('toResponse', () => {
    it('should convert article to response DTO', () => {
      const response = mockArticle.toResponse();

      expect(response.id).toBe(mockArticle.id);
      expect(response.title).toBe(mockArticle.title);
      expect(response.slug).toBe(mockArticle.slug);
      expect(response.excerpt).toBe(mockArticle.excerpt);
      expect(response.content).toBe(mockArticle.content);
      expect(response.featuredImage).toBe(mockArticle.featuredImage);
      expect(response.galleries).toBe(mockArticle.galleries);
      expect(response.seo).toBe(mockArticle.seo);
      expect(response.categories).toBe(mockArticle.categories);
      expect(response.tags).toBe(mockArticle.tags);
      expect(response.author).toBe(mockArticle.author);
      expect(response.relatedArticles).toBe(mockArticle.relatedArticles);
      expect(response.ads).toBe(mockArticle.ads);
      expect(response.publishedAt).toBe(mockArticle.publishedAt.toISOString());
      expect(response.updatedAt).toBe(mockArticle.updatedAt.toISOString());
      expect(response.status).toBe(mockArticle.status);
      expect(response.commentStatus).toBe(mockArticle.commentStatus);
      expect(response.pingStatus).toBe(mockArticle.pingStatus);
      expect(response.commentCount).toBe(mockArticle.commentCount);
      expect(response.viewCount).toBe(mockArticle.viewCount);
      expect(response.isSticky).toBe(mockArticle.isSticky);
      expect(response.format).toBe(mockArticle.format);
    });
  });

  describe('sanitizeHtmlContent', () => {
    it('should remove script tags', () => {
      const content = '<p>Safe content</p><script>alert("xss")</script>';
      const sanitized = Article.sanitizeHtmlContent(content);
      
      expect(sanitized).toBe('<p>Safe content</p>');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert("xss")');
    });

    it('should remove iframe tags', () => {
      const content = '<p>Safe content</p><iframe src="malicious.com"></iframe>';
      const sanitized = Article.sanitizeHtmlContent(content);
      
      expect(sanitized).toBe('<p>Safe content</p>');
      expect(sanitized).not.toContain('<iframe>');
    });

    it('should remove javascript: protocol', () => {
      const content = '<a href="javascript:alert(\'xss\')">Link</a>';
      const sanitized = Article.sanitizeHtmlContent(content);
      
      expect(sanitized).toBe('<a href="alert(\'xss\')">Link</a>');
    });

    it('should remove event handlers', () => {
      const content = '<button onclick="alert(\'xss\')">Click me</button>';
      const sanitized = Article.sanitizeHtmlContent(content);
      
      expect(sanitized).not.toContain('onclick=');
      expect(sanitized).toContain('Click me');
    });
  });

  describe('sanitizedContent getter', () => {
    it('should return sanitized content', () => {
      const article = new Article(
        1,
        'Test Title',
        'test-slug',
        'Test excerpt',
        '<p>Safe content</p><script>alert("xss")</script>',
        null,
        [],
        mockArticleSeo,
        [],
        [],
        mockArticleAuthor,
        [],
        [],
        new Date(),
        new Date(),
        'publish',
        'open',
        'open',
        0,
      );

      expect(article.sanitizedContent).toBe('<p>Safe content</p>');
    });
  });

  describe('readingTime getter', () => {
    it('should calculate reading time correctly', () => {
      const content = 'word '.repeat(400).trim(); // 400 words
      const article = new Article(
        1,
        'Test Title',
        'test-slug',
        'Test excerpt',
        content,
        null,
        [],
        mockArticleSeo,
        [],
        [],
        mockArticleAuthor,
        [],
        [],
        new Date(),
        new Date(),
        'publish',
        'open',
        'open',
        0,
      );

      expect(article.readingTime).toBe(2); // 400 words / 200 words per minute = 2 minutes
    });

    it('should handle HTML content', () => {
      const content = '<p>' + 'word '.repeat(200).trim() + '</p>';
      const article = new Article(
        1,
        'Test Title',
        'test-slug',
        'Test excerpt',
        content,
        null,
        [],
        mockArticleSeo,
        [],
        [],
        mockArticleAuthor,
        [],
        [],
        new Date(),
        new Date(),
        'publish',
        'open',
        'open',
        0,
      );

      expect(article.readingTime).toBe(1); // 200 words / 200 words per minute = 1 minute
    });
  });
}); 