/**
 * Article Repository Implementation
 *
 * Implements the ArticleRepository interface with WordPress database integration.
 * This repository handles all article-related data operations.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/infrastructure/prisma.service';
import { ArticleRepository } from '../../domain/repositories/article.repository.interface';
import { 
  Article, 
  ArticleAuthor, 
  ArticleCategory, 
  ArticleTag, 
  ArticleMedia, 
  ArticleGallery, 
  ArticleSeo, 
  ArticleAd,
  RelatedArticle 
} from '../../domain/entities/article.entity';

@Injectable()
export class ArticleRepositoryImpl implements ArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: number): Promise<Article | null> {
    const post = await this.prisma.aprPosts.findUnique({
      where: { id: BigInt(id) },
      include: {
        metas: true,
        termRelationships: {
          include: {
            termTaxonomy: {
              include: {
                term: true,
              },
            },
          },
        },
      },
    });

    if (!post || post.postStatus !== 'publish') {
      return null;
    }

    return await this.buildArticleFromPost(post);
  }

  async getBySlug(slug: string): Promise<Article | null> {
    const post = await this.prisma.aprPosts.findFirst({
      where: { 
        postName: slug,
        postStatus: 'publish',
        postType: 'post',
      },
      include: {
        metas: true,
        termRelationships: {
          include: {
            termTaxonomy: {
              include: {
                term: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return null;
    }

    return await this.buildArticleFromPost(post);
  }

  async getByCategory(categoryId: number, limit = 10): Promise<Article[]> {
    const posts = await this.prisma.aprPosts.findMany({
      where: {
        postStatus: 'publish',
        postType: 'post',
        termRelationships: {
          some: {
            termTaxonomy: {
              termId: BigInt(categoryId),
              taxonomy: 'category',
            },
          },
        },
      },
      include: {
        metas: true,
        termRelationships: {
          include: {
            termTaxonomy: {
              include: {
                term: true,
              },
            },
          },
        },
      },
      orderBy: {
        postDate: 'desc',
      },
      take: limit,
    });

    return Promise.all(posts.map(post => this.buildArticleFromPost(post)));
  }

  async getRelatedArticles(articleId: number, limit = 5): Promise<Article[]> {
    // Get categories of the current article
    const currentArticle = await this.prisma.aprPosts.findUnique({
      where: { id: BigInt(articleId) },
      include: {
        termRelationships: {
          include: {
            termTaxonomy: {
              include: {
                term: true,
              },
            },
          },
        },
      },
    });

    if (!currentArticle) {
      return [];
    }

    const categoryIds = currentArticle.termRelationships
      .filter(rel => rel.termTaxonomy.taxonomy === 'category')
      .map(rel => rel.termTaxonomy.termId);

    if (categoryIds.length === 0) {
      return [];
    }

    // Find articles in the same categories
    const relatedPosts = await this.prisma.aprPosts.findMany({
      where: {
        id: { not: BigInt(articleId) },
        postStatus: 'publish',
        postType: 'post',
        termRelationships: {
          some: {
            termTaxonomy: {
              termId: { in: categoryIds },
              taxonomy: 'category',
            },
          },
        },
      },
      include: {
        metas: true,
        termRelationships: {
          include: {
            termTaxonomy: {
              include: {
                term: true,
              },
            },
          },
        },
      },
      orderBy: {
        postDate: 'desc',
      },
      take: limit,
    });

    return Promise.all(relatedPosts.map(post => this.buildArticleFromPost(post)));
  }

  async search(query: string, limit = 10): Promise<Article[]> {
    const posts = await this.prisma.aprPosts.findMany({
      where: {
        postStatus: 'publish',
        postType: 'post',
        OR: [
          {
            postTitle: {
              contains: query,
            },
          },
          {
            postContent: {
              contains: query,
            },
          },
          {
            postExcerpt: {
              contains: query,
            },
          },
        ],
      },
      include: {
        metas: true,
        termRelationships: {
          include: {
            termTaxonomy: {
              include: {
                term: true,
              },
            },
          },
        },
      },
      orderBy: {
        postDate: 'desc',
      },
      take: limit,
    });

    return Promise.all(posts.map(post => this.buildArticleFromPost(post)));
  }

  async getByAuthor(authorId: number, limit = 10): Promise<Article[]> {
    const posts = await this.prisma.aprPosts.findMany({
      where: {
        postAuthor: BigInt(authorId),
        postStatus: 'publish',
        postType: 'post',
      },
      include: {
        metas: true,
        termRelationships: {
          include: {
            termTaxonomy: {
              include: {
                term: true,
              },
            },
          },
        },
      },
      orderBy: {
        postDate: 'desc',
      },
      take: limit,
    });

    return Promise.all(posts.map(post => this.buildArticleFromPost(post)));
  }

  async getByTag(tagId: number, limit = 10): Promise<Article[]> {
    const posts = await this.prisma.aprPosts.findMany({
      where: {
        postStatus: 'publish',
        postType: 'post',
        termRelationships: {
          some: {
            termTaxonomy: {
              termId: BigInt(tagId),
              taxonomy: 'post_tag',
            },
          },
        },
      },
      include: {
        metas: true,
        termRelationships: {
          include: {
            termTaxonomy: {
              include: {
                term: true,
              },
            },
          },
        },
      },
      orderBy: {
        postDate: 'desc',
      },
      take: limit,
    });

    return Promise.all(posts.map(post => this.buildArticleFromPost(post)));
  }

  async getRecent(limit = 10): Promise<Article[]> {
    const posts = await this.prisma.aprPosts.findMany({
      where: {
        postStatus: 'publish',
        postType: 'post',
      },
      include: {
        metas: true,
        termRelationships: {
          include: {
            termTaxonomy: {
              include: {
                term: true,
              },
            },
          },
        },
      },
      orderBy: {
        postDate: 'desc',
      },
      take: limit,
    });

    return Promise.all(posts.map(post => this.buildArticleFromPost(post)));
  }

  async getFeatured(limit = 5): Promise<Article[]> {
    const posts = await this.prisma.aprPosts.findMany({
      where: {
        postStatus: 'publish',
        postType: 'post',
        metas: {
          some: {
            metaKey: '_featured_post',
            metaValue: '1',
          },
        },
      },
      include: {
        metas: true,
        termRelationships: {
          include: {
            termTaxonomy: {
              include: {
                term: true,
              },
            },
          },
        },
      },
      orderBy: {
        postDate: 'desc',
      },
      take: limit,
    });

    return Promise.all(posts.map(post => this.buildArticleFromPost(post)));
  }

  private async buildArticleFromPost(post: any): Promise<Article> {
    const metas = this.buildMetaMap(post.metas);
    
    return new Article(
      Number(post.id),
      post.postTitle,
      post.postName,
      post.postExcerpt,
      post.postContent,
      await this.getFeaturedImage(metas),
      await this.getGalleries(metas),
      this.getSeoData(metas),
      this.getCategories(post.termRelationships),
      this.getTags(post.termRelationships),
      await this.getAuthor(Number(post.postAuthor)),
      await this.getRelatedArticlesForEntity(Number(post.id), 3),
      this.getAds(metas),
      post.postDate,
      post.postModified,
      post.postStatus,
      post.commentStatus,
      post.pingStatus,
      Number(post.commentCount),
      this.getViewCount(metas),
      this.isSticky(metas),
      this.getPostFormat(metas),
    );
  }

  private buildMetaMap(metas: any[]): Map<string, string> {
    const metaMap = new Map<string, string>();
    metas.forEach(meta => {
      if (meta.metaKey && meta.metaValue) {
        metaMap.set(meta.metaKey, meta.metaValue);
      }
    });
    return metaMap;
  }

  private async getFeaturedImage(metas: Map<string, string>): Promise<ArticleMedia | null> {
    const thumbnailId = metas.get('_thumbnail_id');
    if (!thumbnailId) {
      return null;
    }

    const imagePost = await this.prisma.aprPosts.findUnique({
      where: { id: BigInt(thumbnailId) },
      include: { metas: true },
    });

    if (!imagePost) {
      return null;
    }

    const imageMetas = this.buildMetaMap(imagePost.metas);
    
    return {
      id: Number(imagePost.id),
      url: imagePost.guid,
      title: imagePost.postTitle,
      alt: imageMetas.get('_wp_attachment_image_alt') || '',
      caption: imagePost.postExcerpt,
      description: imagePost.postContent,
      mimeType: imagePost.postMimeType,
      width: parseInt(imageMetas.get('_wp_attachment_metadata_width') || '0'),
      height: parseInt(imageMetas.get('_wp_attachment_metadata_height') || '0'),
    };
  }

  private async getGalleries(metas: Map<string, string>): Promise<ArticleGallery[]> {
    // Implementation for galleries - this would depend on how galleries are stored
    // For now, return empty array
    return [];
  }

  private getSeoData(metas: Map<string, string>): ArticleSeo {
    return {
      title: metas.get('_yoast_wpseo_title') || metas.get('_aioseop_title'),
      description: metas.get('_yoast_wpseo_metadesc') || metas.get('_aioseop_description'),
      canonical: metas.get('_yoast_wpseo_canonical'),
      focusKeyword: metas.get('_yoast_wpseo_focuskw'),
      metaKeywords: metas.get('_yoast_wpseo_metakeywords'),
      ogTitle: metas.get('_yoast_wpseo_opengraph-title'),
      ogDescription: metas.get('_yoast_wpseo_opengraph-description'),
      ogImage: metas.get('_yoast_wpseo_opengraph-image'),
      twitterTitle: metas.get('_yoast_wpseo_twitter-title'),
      twitterDescription: metas.get('_yoast_wpseo_twitter-description'),
      twitterImage: metas.get('_yoast_wpseo_twitter-image'),
      schema: metas.get('_yoast_wpseo_schema_page_type'),
    };
  }

  private getCategories(termRelationships: any[]): ArticleCategory[] {
    return termRelationships
      .filter(rel => rel.termTaxonomy.taxonomy === 'category')
      .map(rel => ({
        id: Number(rel.termTaxonomy.termId),
        name: rel.termTaxonomy.term.name,
        slug: rel.termTaxonomy.term.slug,
        description: rel.termTaxonomy.description,
      }));
  }

  private getTags(termRelationships: any[]): ArticleTag[] {
    return termRelationships
      .filter(rel => rel.termTaxonomy.taxonomy === 'post_tag')
      .map(rel => ({
        id: Number(rel.termTaxonomy.termId),
        name: rel.termTaxonomy.term.name,
        slug: rel.termTaxonomy.term.slug,
        description: rel.termTaxonomy.description,
      }));
  }

  private async getAuthor(authorId: number): Promise<ArticleAuthor> {
    // For now, return a mock author - in real implementation, you'd query wp_users
    return {
      id: authorId,
      name: 'Author ' + authorId,
      email: `author${authorId}@example.com`,
      bio: 'Author biography',
      avatar: `https://www.gravatar.com/avatar/default?s=96&d=mm&r=g`,
    };
  }

  private getAds(metas: Map<string, string>): ArticleAd[] {
    // Implementation for ads - this would depend on how ads are configured
    // For now, return placeholder ads
    return [
      {
        id: 'top-banner',
        position: 'top',
        type: 'placeholder',
        content: 'Top banner ad placeholder',
      },
      {
        id: 'middle-banner',
        position: 'middle',
        type: 'placeholder',
        content: 'Middle banner ad placeholder',
      },
    ];
  }

  private getViewCount(metas: Map<string, string>): number | undefined {
    const viewCount = metas.get('post_views_count') || metas.get('_post_views_count');
    return viewCount ? parseInt(viewCount) : undefined;
  }

  private isSticky(metas: Map<string, string>): boolean {
    return metas.get('_sticky') === '1';
  }

  private getPostFormat(metas: Map<string, string>): string | undefined {
    return metas.get('_wp_post_format');
  }

  private async getRelatedArticlesForEntity(articleId: number, limit = 3): Promise<RelatedArticle[]> {
    const relatedArticles = await this.getRelatedArticles(articleId, limit);
    return relatedArticles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
      publishedAt: article.publishedAt,
      author: article.author,
      categories: article.categories,
    }));
  }
} 