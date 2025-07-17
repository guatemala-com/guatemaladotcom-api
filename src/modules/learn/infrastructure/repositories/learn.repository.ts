import { Injectable } from '@nestjs/common';
import { LearnRepository } from '../../domain/repositories/learn.repository.interface';
import { LearnCategory } from '../../domain/entities/category.entity';
import {
  LearnPost,
  LearnPostImage,
  LearnPostCategory,
  LearnPostAuthor,
  LearnPostSponsor,
  LearnPostSeo,
} from '../../domain/entities/learn-post.entity';
import { PrismaService } from '../../../prisma/infrastructure/prisma.service';
import { Prisma } from '@prisma/client';

// Type definitions for better type safety
type PostMeta = Prisma.AprPostmetaGetPayload<object>;
type TermRelationship = Prisma.AprTermRelationshipsGetPayload<{
  include: {
    termTaxonomy: {
      include: {
        term: true;
      };
    };
  };
}>;
type LearnMeta = Prisma.AprLearnMetaGetPayload<object>;

@Injectable()
export class LearnRepositoryImpl implements LearnRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories(): Promise<LearnCategory[]> {
    const mockCategories = [
      {
        id: 1,
        name: 'Category 1',
        slug: 'category-1',
        description: 'Description 1',
      },
      {
        id: 2,
        name: 'Category 2',
        slug: 'category-2',
        description: 'Description 2',
      },
    ];

    return Promise.resolve(
      mockCategories.map((category) => {
        return new LearnCategory(
          category.id,
          category.name,
          category.slug,
          category.description,
          new Date(),
          new Date(),
        );
      }),
    );
  }

  getCategoryById(id: number): Promise<LearnCategory | null> {
    const mockCategories = [
      {
        id: 1,
        name: 'Category 1',
        slug: 'category-1',
        description: 'Description 1',
      },
      {
        id: 2,
        name: 'Category 2',
        slug: 'category-2',
        description: 'Description 2',
      },
    ];

    const category = mockCategories.find((cat) => cat.id === id);

    if (!category) {
      return Promise.resolve(null);
    }

    return Promise.resolve(
      new LearnCategory(
        category.id,
        category.name,
        category.slug,
        category.description,
        new Date(),
        new Date(),
      ),
    );
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

    // Build the learn post from WordPress data
    const images = await this.buildImages(post.metas);
    const categories = this.buildCategories(post.termRelationships);
    const author = this.buildAuthor(post.postAuthor);
    const sponsor = this.buildSponsor(learnMeta);
    const locationGeopoint = this.buildLocationGeopoint(post.metas);
    const seo = this.buildSeo(post.metas, post.postTitle, post.postExcerpt);

    return LearnPost.fromDatabase({
      id: Number(post.id),
      url: this.buildUrl(post.postName),
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

  private buildUrl(postName: string): string {
    return `https://stagingaprende.guatemala.com/${postName}`;
  }

  private async buildImages(metas: PostMeta[]): Promise<LearnPostImage[]> {
    const thumbnailMeta = metas.find(
      (meta) => meta.metaKey === '_thumbnail_id',
    );

    if (!thumbnailMeta?.metaValue) {
      return [];
    }

    const attachmentId = parseInt(thumbnailMeta.metaValue, 10);
    const attachment = await this.prisma.aprPosts.findUnique({
      where: { id: BigInt(attachmentId) },
      include: { metas: true },
    });

    if (!attachment) {
      return [];
    }

    const attachmentUrl = attachment.guid;
    const titleMeta = attachment.metas.find(
      (meta) => meta.metaKey === '_wp_attachment_image_alt',
    );
    const captionMeta = attachment.metas.find(
      (meta) => meta.metaKey === '_wp_attachment_image_caption',
    );

    return [
      {
        original: attachmentUrl,
        thumbnail: attachmentUrl,
        medium: attachmentUrl,
        web_gallery: attachmentUrl,
        app_medium: attachmentUrl,
        events_calendar_thumb: attachmentUrl,
        events_square_100: attachmentUrl,
        events_related: attachmentUrl,
        events_xl: attachmentUrl,
        image_meta: {
          title: titleMeta?.metaValue || attachment.postTitle,
          caption: captionMeta?.metaValue || attachment.postExcerpt,
        },
      },
    ];
  }

  private buildCategories(
    termRelationships: TermRelationship[],
  ): LearnPostCategory[] {
    return termRelationships
      .filter((rel) => rel.termTaxonomy.taxonomy === 'category')
      .map((rel) => ({
        category_id: Number(rel.termTaxonomy.term.termId),
        category_name: rel.termTaxonomy.term.name,
        category_slug: rel.termTaxonomy.term.slug,
      }));
  }

  private buildAuthor(authorId: bigint): LearnPostAuthor {
    // For now, return a default author since user table structure is not defined
    return {
      name: 'Ivon Kwei',
      id: Number(authorId),
    };
  }

  private buildSponsor(learnMeta: LearnMeta | null): LearnPostSponsor {
    if (!learnMeta) {
      return {
        name: '',
        image_url: '',
        image: [],
        image_sidebar_url: '',
        image_sidebar: [],
        image_content_url: '',
        image_content: [],
        extra_data: '',
      };
    }

    return {
      name: learnMeta.sponsorName || '',
      image_url: learnMeta.sponsorUrl || '',
      image: [],
      image_sidebar_url: learnMeta.sponsorImageSidebarUrl || '',
      image_sidebar: [],
      image_content_url: learnMeta.sponsorImageContentUrl || '',
      image_content: [],
      extra_data: learnMeta.sponsorExtraData || '',
    };
  }

  private buildLocationGeopoint(
    metas: PostMeta[],
  ): { latitude: string; longitude: string } | null {
    const latMeta = metas.find((meta) => meta.metaKey === 'latitude');
    const longMeta = metas.find((meta) => meta.metaKey === 'longitude');

    if (!latMeta?.metaValue || !longMeta?.metaValue) {
      return null;
    }

    return {
      latitude: latMeta.metaValue,
      longitude: longMeta.metaValue,
    };
  }

  private buildSeo(
    metas: PostMeta[],
    postTitle: string,
    postExcerpt: string,
  ): LearnPostSeo {
    // RankMath SEO meta keys
    const seoTitleMeta = metas.find(
      (meta) => meta.metaKey === 'rank_math_title',
    );
    const seoTitle = seoTitleMeta?.metaValue || postTitle;

    const seoDescriptionMeta = metas.find(
      (meta) => meta.metaKey === 'rank_math_description',
    );
    const seoDescription = seoDescriptionMeta?.metaValue || postExcerpt;

    const canonicalMeta = metas.find(
      (meta) => meta.metaKey === 'rank_math_canonical_url',
    );
    const canonical = canonicalMeta?.metaValue || '';

    const focusKeywordMeta = metas.find(
      (meta) => meta.metaKey === 'rank_math_focus_keyword',
    );
    const focusKeyword = focusKeywordMeta?.metaValue || '';

    const seoScoreMeta = metas.find(
      (meta) => meta.metaKey === 'rank_math_seo_score',
    );
    const seoScore = parseInt(seoScoreMeta?.metaValue || '0', 10);

    // Open Graph fields
    const ogTitleMeta = metas.find(
      (meta) => meta.metaKey === 'rank_math_facebook_title',
    );
    const ogTitle = ogTitleMeta?.metaValue || seoTitle;

    const ogDescriptionMeta = metas.find(
      (meta) => meta.metaKey === 'rank_math_facebook_description',
    );
    const ogDescription = ogDescriptionMeta?.metaValue || seoDescription;

    const ogImageMeta = metas.find(
      (meta) => meta.metaKey === 'rank_math_facebook_image',
    );
    const ogImage = ogImageMeta?.metaValue || '';

    // Twitter fields
    const twitterTitleMeta = metas.find(
      (meta) => meta.metaKey === 'rank_math_twitter_title',
    );
    const twitterTitle = twitterTitleMeta?.metaValue || ogTitle;

    const twitterDescriptionMeta = metas.find(
      (meta) => meta.metaKey === 'rank_math_twitter_description',
    );
    const twitterDescription =
      twitterDescriptionMeta?.metaValue || ogDescription;

    const twitterImageMeta = metas.find(
      (meta) => meta.metaKey === 'rank_math_twitter_image',
    );
    const twitterImage = twitterImageMeta?.metaValue || ogImage;

    return {
      title: seoTitle,
      description: seoDescription,
      canonical,
      focus_keyword: focusKeyword,
      seo_score: seoScore,
      og_title: ogTitle,
      og_description: ogDescription,
      og_image: ogImage,
      twitter_title: twitterTitle,
      twitter_description: twitterDescription,
      twitter_image: twitterImage,
    };
  }
}
