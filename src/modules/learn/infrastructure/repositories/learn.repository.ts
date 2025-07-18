import { Injectable } from '@nestjs/common';
import { LearnRepository } from '../../domain/repositories/learn.repository.interface';
import { LearnCategory } from '../../domain/entities/category.entity';
import { LearnPost } from '../../domain/entities/learn-post.entity';
import { PrismaService } from '../../../prisma/infrastructure/prisma.service';
import { META_KEYS } from '../consts/meta-keys.const';
import { TAXONOMIES } from '../consts/taxonomies';
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
    return this.learnPostBuilder.buildHierarchy(categoryEntities);
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

    return LearnCategory.fromDatabase({
      id: Number(category.term.termId),
      name: category.term.name,
      slug: category.term.slug,
      description: category.description,
      parent: Number(category.parent),
      count: Number(category.count),
    });
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

    if (!post || post.postStatus !== 'publish') {
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
