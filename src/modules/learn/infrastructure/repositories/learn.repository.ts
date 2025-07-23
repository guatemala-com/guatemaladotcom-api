import { Injectable } from '@nestjs/common';
import {
  LearnRepository,
  PaginationOptions,
  PaginatedResult,
} from '../../domain/repositories/learn.repository.interface';
import { LearnCategory } from '../../domain/entities/category.entity';
import { LearnPost } from '../../domain/entities/learn-post.entity';
import { PrismaService } from '../../../prisma/infrastructure/prisma.service';
import { META_KEYS } from '../consts/meta-keys.const';
import { TAXONOMIES } from '../consts/taxonomies';
import { POST_STATUS } from '../consts/post-status';
import {
  CategoryWithTerm,
  AttachmentPost,
  TermRelationship,
} from '../../domain/types/prisma-types';
import { LearnPostBuilderService } from '../services/learn-post-builder.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LearnRepositoryImpl implements LearnRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly learnPostBuilder: LearnPostBuilderService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Build category path for a post based on its categories
   * Returns the deepest (most specific) category path
   */
  private async buildCategoryPath(
    termRelationships: TermRelationship[],
  ): Promise<string> {
    if (termRelationships.length === 0) {
      return '';
    }

    // Get all categories for this post
    const categoryRelationships = termRelationships.filter(
      (rel) => rel?.termTaxonomy?.taxonomy === TAXONOMIES.CATEGORY,
    );

    if (categoryRelationships.length === 0) {
      return '';
    }

    // Find the deepest category (the one with the highest level in hierarchy)
    let deepestCategory: TermRelationship['termTaxonomy'] | null = null;
    let maxDepth = -1;

    for (const rel of categoryRelationships) {
      const categoryId = Number(rel.termTaxonomy.term.termId);
      const depth = await this.getCategoryDepth(categoryId);

      if (depth > maxDepth) {
        maxDepth = depth;
        deepestCategory = rel.termTaxonomy;
      }
    }

    if (!deepestCategory) {
      return '';
    }

    // Build the full path from root to this category
    return await this.buildCategoryPathRecursive(
      Number(deepestCategory.term.termId),
    );
  }

  /**
   * Get the depth level of a category in the hierarchy
   */
  private async getCategoryDepth(categoryId: number): Promise<number> {
    const category = await this.prisma.aprTermTaxonomy.findFirst({
      where: {
        term: { termId: BigInt(categoryId) },
        taxonomy: TAXONOMIES.CATEGORY,
      },
      include: { term: true },
    });

    if (!category || category.parent === BigInt(0)) {
      return 0;
    }

    const parentDepth = await this.getCategoryDepth(Number(category.parent));
    return parentDepth + 1;
  }

  /**
   * Build category path recursively from category ID to root
   */
  private async buildCategoryPathRecursive(
    categoryId: number,
  ): Promise<string> {
    const category = await this.prisma.aprTermTaxonomy.findFirst({
      where: {
        term: { termId: BigInt(categoryId) },
        taxonomy: TAXONOMIES.CATEGORY,
      },
      include: { term: true },
    });

    if (!category) {
      return '';
    }

    const slug = category.term.slug;

    if (category.parent === BigInt(0)) {
      // Root category
      return slug;
    }

    // Get parent path and append current slug
    const parentPath = await this.buildCategoryPathRecursive(
      Number(category.parent),
    );
    return parentPath ? `${parentPath}/${slug}` : slug;
  }

  async getCategories(): Promise<LearnCategory[]> {
    // Get all categories from WordPress database
    const categories: CategoryWithTerm[] =
      await this.prisma.aprTermTaxonomy.findMany({
        where: {
          taxonomy: TAXONOMIES.CATEGORY,
          count: {
            gt: 0, // Only categories with articles
          },
        },
        include: {
          term: true,
        },
        orderBy: {
          term: {
            name: 'asc',
          },
        },
      });

    // Convert to domain entities and build hierarchy
    const categoryEntities = categories.map((category) =>
      LearnCategory.fromDatabase({
        id: Number(category.term.termId),
        name: category.term.name,
        slug: category.term.slug,
        description: category.description,
        parent: Number(category.parent),
        count: Number(category.count),
      }),
    );

    // Build hierarchical structure
    return this.buildHierarchy(categoryEntities);
  }

  async getCategoryById(id: number): Promise<LearnCategory | null> {
    const category: CategoryWithTerm | null =
      await this.prisma.aprTermTaxonomy.findFirst({
        where: {
          term: {
            termId: BigInt(id),
          },
          taxonomy: TAXONOMIES.CATEGORY,
        },
        include: {
          term: true,
        },
      });

    if (!category) {
      return null;
    }

    // Get children for this specific category
    const children = await this.getCategoryChildren(
      Number(category.term.termId),
    );

    return LearnCategory.fromDatabase({
      id: Number(category.term.termId),
      name: category.term.name,
      slug: category.term.slug,
      description: category.description,
      parent: Number(category.parent),
      count: Number(category.count),
      children,
    });
  }

  async getCategoryBySlug(slug: string): Promise<LearnCategory | null> {
    const category: CategoryWithTerm | null =
      await this.prisma.aprTermTaxonomy.findFirst({
        where: {
          term: {
            slug: slug,
          },
          taxonomy: TAXONOMIES.CATEGORY,
        },
        include: {
          term: true,
        },
      });

    if (!category) {
      return null;
    }

    // Get children for this specific category
    const children = await this.getCategoryChildren(
      Number(category.term.termId),
    );

    return LearnCategory.fromDatabase({
      id: Number(category.term.termId),
      name: category.term.name,
      slug: category.term.slug,
      description: category.description,
      parent: Number(category.parent),
      count: Number(category.count),
      children,
    });
  }

  /**
   * Get all children categories for a specific parent category ID
   */
  private async getCategoryChildren(
    parentId: number,
  ): Promise<LearnCategory[]> {
    // Get direct children
    const directChildren: CategoryWithTerm[] =
      await this.prisma.aprTermTaxonomy.findMany({
        where: {
          parent: BigInt(parentId),
          taxonomy: TAXONOMIES.CATEGORY,
        },
        include: {
          term: true,
        },
        orderBy: {
          term: {
            name: 'asc',
          },
        },
      });

    // Recursively build children with their own children
    const children: LearnCategory[] = [];
    for (const child of directChildren) {
      const childId = Number(child.term.termId);
      const grandChildren = await this.getCategoryChildren(childId);

      children.push(
        LearnCategory.fromDatabase({
          id: childId,
          name: child.term.name,
          slug: child.term.slug,
          description: child.description,
          parent: Number(child.parent),
          count: Number(child.count),
          children: grandChildren,
        }),
      );
    }

    return children;
  }

  /**
   * Build hierarchical structure from flat category list
   */
  private buildHierarchy(categories: LearnCategory[]): LearnCategory[] {
    const categoryMap = new Map<number, LearnCategory>();
    const rootCategoryIds: number[] = [];
    const childrenMap = new Map<number, number[]>(); // parent_id -> [child_ids]

    // First pass: create map of all categories and build parent-child relationships
    categories.forEach((category) => {
      categoryMap.set(category.id, category);

      if (category.parent === 0) {
        rootCategoryIds.push(category.id);
      } else {
        // Track parent-child relationships
        if (!childrenMap.has(category.parent)) {
          childrenMap.set(category.parent, []);
        }
        childrenMap.get(category.parent)!.push(category.id);
      }
    });

    // Recursive function to build category with all its children
    const buildCategoryWithChildren = (categoryId: number): LearnCategory => {
      const category = categoryMap.get(categoryId)!;
      const childIds = childrenMap.get(categoryId) || [];

      // Recursively build children
      const children = childIds.map((childId) =>
        buildCategoryWithChildren(childId),
      );

      // Return category with populated children
      return new LearnCategory(
        category.id,
        category.name,
        category.slug,
        category.description,
        category.parent,
        category.count,
        children,
      );
    };

    // Build root categories with all their nested children
    return rootCategoryIds.map((rootId) => buildCategoryWithChildren(rootId));
  }
  async getLearnPostById(id: number): Promise<LearnPost | null> {
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

    if (!post || post.postStatus !== POST_STATUS.PUBLISH) {
      return null;
    }

    const learnMeta = await this.prisma.aprLearnMeta.findUnique({
      where: { id: Number(post.id) },
    });

    // Get attachment data in a single query if thumbnail exists
    const thumbnailMeta = post.metas.find(
      (meta) => meta.metaKey === META_KEYS.THUMBNAIL_ID,
    );

    let attachment: AttachmentPost | null = null;
    if (thumbnailMeta?.metaValue) {
      const attachmentId = parseInt(thumbnailMeta.metaValue, 10);
      attachment = await this.prisma.aprPosts.findUnique({
        where: { id: BigInt(attachmentId) },
        include: { metas: true },
      });
    }

    // Build the learn post from WordPress data
    const images = this.learnPostBuilder.buildImages(attachment);
    const categories = this.learnPostBuilder.buildCategories(
      post.termRelationships,
    );
    const author = this.learnPostBuilder.buildAuthor(post.postAuthor);
    const sponsor = this.learnPostBuilder.buildSponsor(learnMeta);
    const locationGeopoint = this.learnPostBuilder.buildLocationGeopoint(
      post.metas,
    );
    const seo = this.learnPostBuilder.buildSeo(
      post.metas,
      post.postTitle,
      post.postExcerpt,
    );

    // Build the full category path for the URL
    const categoryPath = await this.buildCategoryPath(post.termRelationships);
    const fullUrl = categoryPath
      ? `${this.configService.get('APP_URL')}/${categoryPath}/${post.postName}`
      : `${this.configService.get('APP_URL')}/${post.postName}`;

    return LearnPost.fromDatabase({
      id: Number(post.id),
      url: fullUrl,
      title: post.postTitle,
      excerpt: post.postExcerpt,
      date: post.postDate.toISOString(),
      images,
      locationGeopoint,
      content: post.postContent,
      categories,
      author,
      keywords: [],
      isSponsored: learnMeta?.isSponsored ? 1 : 0,
      sponsor,
      seo,
    });
  }

  async getLearnPostBySlug(
    categoryPath: string,
    articleSlug: string,
  ): Promise<LearnPost | null> {
    // Parse category path (e.g., "cultura-guatemalteca/patrimonios" -> ["cultura-guatemalteca", "patrimonios"])
    const categoryParts = categoryPath.split('/');
    const targetCategorySlug = categoryParts[categoryParts.length - 1]; // Get the last (deepest) category

    // Find the target category by slug
    const category = await this.prisma.aprTermTaxonomy.findFirst({
      where: {
        term: {
          slug: targetCategorySlug,
        },
        taxonomy: TAXONOMIES.CATEGORY,
      },
      include: {
        term: true,
      },
    });

    if (!category) {
      return null;
    }

    // Verify the full category path matches
    const actualCategoryPath = await this.buildCategoryPathRecursive(
      Number(category.term.termId),
    );
    if (actualCategoryPath !== categoryPath) {
      return null; // Category path doesn't match
    }

    // Find the post by slug that belongs to this category
    const post = await this.prisma.aprPosts.findFirst({
      where: {
        postName: articleSlug,
        postType: 'post',
        postStatus: POST_STATUS.PUBLISH,
        termRelationships: {
          some: {
            termTaxonomyId: category.termTaxonomyId,
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
    });

    if (!post) {
      return null;
    }

    const learnMeta = await this.prisma.aprLearnMeta.findUnique({
      where: { id: Number(post.id) },
    });

    // Get attachment data in a single query if thumbnail exists
    const thumbnailMeta = post.metas.find(
      (meta) => meta.metaKey === META_KEYS.THUMBNAIL_ID,
    );

    let attachment: AttachmentPost | null = null;
    if (thumbnailMeta?.metaValue) {
      const attachmentId = parseInt(thumbnailMeta.metaValue, 10);
      attachment = await this.prisma.aprPosts.findUnique({
        where: { id: BigInt(attachmentId) },
        include: { metas: true },
      });
    }

    // Build the learn post from WordPress data
    const images = this.learnPostBuilder.buildImages(attachment);
    const categories = this.learnPostBuilder.buildCategories(
      post.termRelationships,
    );
    const author = this.learnPostBuilder.buildAuthor(post.postAuthor);
    const sponsor = this.learnPostBuilder.buildSponsor(learnMeta);
    const locationGeopoint = this.learnPostBuilder.buildLocationGeopoint(
      post.metas,
    );
    const seo = this.learnPostBuilder.buildSeo(
      post.metas,
      post.postTitle,
      post.postExcerpt,
    );

    // Use the provided category path for the URL
    const fullUrl = `${this.configService.get('APP_URL')}/${categoryPath}/${post.postName}`;

    return LearnPost.fromDatabase({
      id: Number(post.id),
      url: fullUrl,
      title: post.postTitle,
      excerpt: post.postExcerpt,
      date: post.postDate.toISOString(),
      images,
      locationGeopoint,
      content: post.postContent,
      categories,
      author,
      keywords: [],
      isSponsored: learnMeta?.isSponsored ? 1 : 0,
      sponsor,
      seo,
    });
  }

  async getArticlesByCategory(
    categorySlug: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<LearnPost>> {
    // First, find the category by slug to get its ID
    const category = await this.prisma.aprTermTaxonomy.findFirst({
      where: {
        term: {
          slug: categorySlug,
        },
        taxonomy: TAXONOMIES.CATEGORY,
      },
      include: {
        term: true,
      },
    });

    if (!category) {
      return {
        data: [],
        total: 0,
      };
    }

    // Calculate pagination
    const skip = (options.page - 1) * options.limit;

    // Get posts that belong to this category
    const [posts, total] = await Promise.all([
      this.prisma.aprPosts.findMany({
        where: {
          postType: 'post',
          postStatus: POST_STATUS.PUBLISH,
          termRelationships: {
            some: {
              termTaxonomyId: category.termTaxonomyId,
            },
          },
        },
        include: {
          metas: {
            where: {
              metaKey: META_KEYS.THUMBNAIL_ID,
            },
          },
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
        skip,
        take: options.limit,
      }),
      this.prisma.aprPosts.count({
        where: {
          postType: 'post',
          postStatus: POST_STATUS.PUBLISH,
          termRelationships: {
            some: {
              termTaxonomyId: category.termTaxonomyId,
            },
          },
        },
      }),
    ]);

    // Build LearnPost entities for each post
    const learnPosts = await Promise.all(
      posts.map(async (post) => {
        const learnMeta = await this.prisma.aprLearnMeta.findUnique({
          where: { id: Number(post.id) },
        });

        // Get attachment data for thumbnail
        const thumbnailMeta = post.metas.find(
          (meta) => meta.metaKey === META_KEYS.THUMBNAIL_ID,
        );

        let attachment: AttachmentPost | null = null;
        if (thumbnailMeta?.metaValue) {
          const attachmentId = parseInt(thumbnailMeta.metaValue, 10);
          attachment = await this.prisma.aprPosts.findUnique({
            where: { id: BigInt(attachmentId) },
            include: { metas: true },
          });
        }

        // Build the learn post components
        const images = this.learnPostBuilder.buildImages(attachment);
        const categories = this.learnPostBuilder.buildCategories(
          post.termRelationships,
        );
        const author = this.learnPostBuilder.buildAuthor(post.postAuthor);
        const sponsor = this.learnPostBuilder.buildSponsor(learnMeta);
        const seo = this.learnPostBuilder.buildSeo(
          [],
          post.postTitle,
          post.postExcerpt,
        );

        // Build the full category path for the URL
        const categoryPath = await this.buildCategoryPath(
          post.termRelationships,
        );
        const fullUrl = categoryPath
          ? `${this.configService.get('APP_URL')}/${categoryPath}/${post.postName}`
          : `${this.configService.get('APP_URL')}/${post.postName}`;

        return LearnPost.fromDatabase({
          id: Number(post.id),
          url: fullUrl,
          title: post.postTitle,
          excerpt: post.postExcerpt,
          date: post.postDate.toISOString(),
          images,
          locationGeopoint: null,
          content: '',
          categories,
          author,
          keywords: [],
          isSponsored: learnMeta?.isSponsored ? 1 : 0,
          sponsor,
          seo,
        });
      }),
    );

    return {
      data: learnPosts,
      total,
    };
  }
}
