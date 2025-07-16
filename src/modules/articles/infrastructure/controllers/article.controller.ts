/**
 * Article Controller
 *
 * Handles HTTP requests related to articles.
 * Provides endpoints for retrieving articles by ID and slug.
 * 
 * @swagger
 * tags:
 *   name: Articles
 *   description: Article management endpoints
 */

import { Controller, Get, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { OAuthAuthRead } from '../../../auth/infrastructure/decorators/oauth-scopes.decorator';
import { GetArticleByIdUseCase } from '../../application/use-cases/get-article-by-id.use-case';
import { GetArticleBySlugUseCase } from '../../application/use-cases/get-article-by-slug.use-case';
import { ArticleResponseDto } from '../../application/dtos/article.dto';

@OAuthAuthRead()
@Controller('articles')
export class ArticleController {
  constructor(
    private readonly getArticleByIdUseCase: GetArticleByIdUseCase,
    private readonly getArticleBySlugUseCase: GetArticleBySlugUseCase,
  ) {}

  /**
   * Get article by ID or slug
   * 
   * @swagger
   * /articles/{identifier}:
   *   get:
   *     summary: Get article by ID or slug
   *     description: Retrieves an article by its ID (numeric) or slug (string). 
   *                  If the identifier is numeric, it will be treated as an ID.
   *                  If it's a string, it will be treated as a slug.
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: identifier
   *         required: true
   *         description: Article ID (numeric) or slug (string)
   *         schema:
   *           type: string
   *           example: "123" or "my-article-slug"
   *     responses:
   *       200:
   *         description: Article found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   description: Article ID
   *                 title:
   *                   type: string
   *                   description: Article title
   *                 slug:
   *                   type: string
   *                   description: Article slug
   *                 excerpt:
   *                   type: string
   *                   description: Article excerpt
   *                 content:
   *                   type: string
   *                   description: Article content (HTML)
   *                 featuredImage:
   *                   type: object
   *                   description: Featured image information
   *                 categories:
   *                   type: array
   *                   description: Article categories
   *                 tags:
   *                   type: array
   *                   description: Article tags
   *                 author:
   *                   type: object
   *                   description: Article author information
   *                 seo:
   *                   type: object
   *                   description: SEO metadata
   *                 publishedAt:
   *                   type: string
   *                   format: date-time
   *                   description: Published date
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *                   description: Updated date
   *       401:
   *         description: Unauthorized - Invalid or missing OAuth token
   *       403:
   *         description: Forbidden - Insufficient permissions
   *       404:
   *         description: Article not found
   *       500:
   *         description: Internal server error
   * 
   * @param identifier - Article ID or slug
   * @returns ArticleResponseDto
   */
  @Get(':id')
  async getArticle(
    @Param('id') identifier: string,
  ): Promise<ArticleResponseDto> {
    // Check if the identifier is a number (ID) or string (slug)
    const parsedId = parseInt(identifier);
    
    if (!isNaN(parsedId)) {
      // It's a numeric ID
      return this.getArticleByIdUseCase.execute(parsedId);
    } else {
      // It's a slug
      return this.getArticleBySlugUseCase.execute(identifier);
    }
  }

  /**
   * Get article by ID (explicit endpoint)
   * 
   * @swagger
   * /articles/id/{id}:
   *   get:
   *     summary: Get article by ID
   *     description: Retrieves an article by its numeric ID. This is an explicit endpoint that only accepts numeric IDs.
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Numeric article ID
   *         schema:
   *           type: integer
   *           example: 123
   *     responses:
   *       200:
   *         description: Article found
   *       401:
   *         description: Unauthorized - Invalid or missing OAuth token
   *       403:
   *         description: Forbidden - Insufficient permissions
   *       404:
   *         description: Article not found
   *       500:
   *         description: Internal server error
   * 
   * @param id - Article ID
   * @returns ArticleResponseDto
   */
  @Get('id/:id')
  async getArticleById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ArticleResponseDto> {
    return this.getArticleByIdUseCase.execute(id);
  }

  /**
   * Get article by slug (explicit endpoint)
   * 
   * @swagger
   * /articles/slug/{slug}:
   *   get:
   *     summary: Get article by slug
   *     description: Retrieves an article by its slug. This is an explicit endpoint that only accepts string slugs.
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         description: Article slug (URL-friendly string)
   *         schema:
   *           type: string
   *           example: "my-article-slug"
   *     responses:
   *       200:
   *         description: Article found
   *       400:
   *         description: Bad request - Slug cannot be empty
   *       401:
   *         description: Unauthorized - Invalid or missing OAuth token
   *       403:
   *         description: Forbidden - Insufficient permissions
   *       404:
   *         description: Article not found
   *       500:
   *         description: Internal server error
   * 
   * @param slug - Article slug
   * @returns ArticleResponseDto
   */
  @Get('slug/:slug')
  async getArticleBySlug(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseDto> {
    if (!slug || slug.trim() === '') {
      throw new BadRequestException('Slug cannot be empty');
    }
    
    return this.getArticleBySlugUseCase.execute(slug);
  }
} 