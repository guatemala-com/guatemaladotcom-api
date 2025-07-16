import { Injectable } from '@nestjs/common';
import { LearnRepository } from '../../domain/repositories/learn.repository.interface';
import { LearnCategory } from '../../domain/entities/category.entity';
import { LearnPost, LearnPostImage, LearnPostCategory, LearnPostAuthor, LearnPostSponsor } from '../../domain/entities/learn-post.entity';
import { PrismaService } from '../../../prisma/infrastructure/prisma.service';

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
    const categories = await this.buildCategories(post.termRelationships);
    const author = await this.buildAuthor(post.postAuthor);
    const sponsor = await this.buildSponsor(learnMeta);
    const locationGeopoint = await this.buildLocationGeopoint(post.metas);

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
    });
  }

  private buildUrl(postName: string): string {
    return `https://stagingaprende.guatemala.com/${postName}`;
  }

  private async buildImages(metas: any[]): Promise<LearnPostImage[]> {
    const thumbnailMeta = metas.find(meta => meta.metaKey === '_thumbnail_id');
    
    if (!thumbnailMeta) {
      return [];
    }

    const attachmentId = thumbnailMeta.metaValue;
    const attachment = await this.prisma.aprPosts.findUnique({
      where: { id: BigInt(attachmentId) },
      include: { metas: true },
    });

    if (!attachment) {
      return [];
    }

    const attachmentUrl = attachment.guid;
    const titleMeta = attachment.metas.find(meta => meta.metaKey === '_wp_attachment_image_alt');
    const captionMeta = attachment.metas.find(meta => meta.metaKey === '_wp_attachment_image_caption');

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

  private async buildCategories(termRelationships: any[]): Promise<LearnPostCategory[]> {
    return termRelationships
      .filter(rel => rel.termTaxonomy.taxonomy === 'category')
      .map(rel => ({
        category_id: Number(rel.termTaxonomy.term.termId),
        category_name: rel.termTaxonomy.term.name,
        category_slug: rel.termTaxonomy.term.slug,
      }));
  }

  private async buildAuthor(authorId: bigint): Promise<LearnPostAuthor> {
    // For now, return a default author since user table structure is not defined
    return {
      name: 'Ivon Kwei',
      id: Number(authorId),
    };
  }

  private async buildSponsor(learnMeta: any): Promise<LearnPostSponsor> {
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

  private async buildLocationGeopoint(metas: any[]): Promise<{ latitude: string; longitude: string } | null> {
    const latMeta = metas.find(meta => meta.metaKey === 'latitude');
    const longMeta = metas.find(meta => meta.metaKey === 'longitude');

    if (!latMeta || !longMeta) {
      return null;
    }

    return {
      latitude: latMeta.metaValue,
      longitude: longMeta.metaValue,
    };
  }
}
