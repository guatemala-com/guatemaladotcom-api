import { Injectable } from '@nestjs/common';
import { LearnRepository } from '../../domain/repositories/learn.repository.interface';
import { LearnCategory } from '../../domain/entities/category.entity';
import { LearnPost } from '../../domain/entities/learn-post.entity';
import { PrismaService } from '../../../prisma/infrastructure/prisma.service';
import { META_KEYS } from '../consts/meta-keys.const';
import { TAXONOMIES } from '../consts/taxonomies';
import { POST_STATUS } from '../consts/post-status';
import {
  CategoryWithTerm,
  AttachmentPost,
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

    return LearnPost.fromDatabase({
      id: Number(post.id),
      url: `${this.configService.get('APP_URL')}/${post.postName}`,
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
}
