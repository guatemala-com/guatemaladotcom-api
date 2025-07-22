import { Injectable } from '@nestjs/common';
import {
  LearnPostImage,
  LearnPostCategory,
  LearnPostAuthor,
  LearnPostSponsor,
  LearnPostSeo,
} from '../../domain/types/learn-post.types';
import { LearnCategory } from '../../domain/entities/category.entity';
import { META_KEYS } from '../consts/meta-keys.const';
import { TAXONOMIES } from '../consts/taxonomies';
import {
  TermRelationship,
  LearnMeta,
  PostMeta,
  AttachmentPost,
} from '../../domain/types/prisma-types';

@Injectable()
export class LearnPostBuilderService {
  /**
   * Build hierarchical structure from flat category list
   */
  buildHierarchy(categories: LearnCategory[]): LearnCategory[] {
    const categoryMap = new Map<number, LearnCategory>();

    // Create a map with mutable categories (copies)
    categories.forEach((category) => {
      categoryMap.set(
        category.id,
        new LearnCategory(
          category.id,
          category.name,
          category.slug,
          category.description,
          category.parent,
          category.count,
          [], // Start with empty children array
        ),
      );
    });

    // Build the hierarchy
    const rootCategories: LearnCategory[] = [];

    categories.forEach((category) => {
      const categoryInMap = categoryMap.get(category.id)!;

      if (category.parent === 0) {
        // This is a root category
        rootCategories.push(categoryInMap);
      } else {
        // This is a child category - add it to its parent
        const parentCategory = categoryMap.get(category.parent);
        if (parentCategory) {
          parentCategory.children.push(categoryInMap);
        }
      }
    });

    return rootCategories;
  }

  buildImages(attachment: AttachmentPost | null): LearnPostImage[] {
    if (!attachment) {
      return [];
    }

    const attachmentUrl = attachment.guid;
    const titleMeta = attachment.metas.find(
      (meta: PostMeta) => meta.metaKey === META_KEYS.IMAGE_ALT,
    );
    const captionMeta = attachment.metas.find(
      (meta: PostMeta) => meta.metaKey === META_KEYS.IMAGE_CAPTION,
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

  buildCategories(termRelationships: TermRelationship[]): LearnPostCategory[] {
    return termRelationships
      .filter((rel) => rel?.termTaxonomy?.taxonomy === TAXONOMIES.CATEGORY)
      .map((rel) => ({
        category_id: Number(rel.termTaxonomy.term.termId),
        category_name: rel.termTaxonomy.term.name,
        category_slug: rel.termTaxonomy.term.slug,
      }));
  }

  buildAuthor(authorId: bigint): LearnPostAuthor {
    // For now, return a default author since user table structure is not defined
    return {
      name: 'Ivon Kwei',
      id: Number(authorId),
    };
  }

  buildSponsor(learnMeta: LearnMeta | null): LearnPostSponsor {
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

  buildLocationGeopoint(
    metas: PostMeta[],
  ): { latitude: string; longitude: string } | null {
    const latMeta = metas.find((meta) => meta.metaKey === META_KEYS.LATITUDE);
    const longMeta = metas.find((meta) => meta.metaKey === META_KEYS.LONGITUDE);

    if (!latMeta?.metaValue || !longMeta?.metaValue) {
      return null;
    }

    return {
      latitude: latMeta.metaValue,
      longitude: longMeta.metaValue,
    };
  }

  buildSeo(
    metas: PostMeta[],
    postTitle: string,
    postExcerpt: string,
  ): LearnPostSeo {
    // RankMath SEO meta keys
    const seoTitleMeta = metas.find(
      (meta) => meta.metaKey === META_KEYS.RANKMATH_TITLE,
    );
    const seoTitle = seoTitleMeta?.metaValue ?? postTitle;
    const seoDescriptionMeta = metas.find(
      (meta) => meta.metaKey === META_KEYS.RANKMATH_DESCRIPTION,
    );
    const seoDescription = seoDescriptionMeta?.metaValue ?? postExcerpt;
    const canonicalMeta = metas.find(
      (meta) => meta.metaKey === META_KEYS.RANKMATH_CANONICAL_URL,
    );
    const canonical = canonicalMeta?.metaValue ?? '';
    const focusKeywordMeta = metas.find(
      (meta) => meta.metaKey === META_KEYS.RANKMATH_FOCUS_KEYWORD,
    );
    const focusKeyword = focusKeywordMeta?.metaValue ?? '';
    const seoScoreMeta = metas.find(
      (meta) => meta.metaKey === META_KEYS.RANKMATH_SEO_SCORE,
    );
    const parsedSeoScore = parseInt(seoScoreMeta?.metaValue ?? '0', 10);
    const seoScore = isNaN(parsedSeoScore) ? 0 : parsedSeoScore;

    // Open Graph fields
    const ogTitleMeta = metas.find(
      (meta) => meta.metaKey === META_KEYS.RANKMATH_FB_TITLE,
    );
    const ogTitle = ogTitleMeta?.metaValue ?? seoTitle;
    const ogDescriptionMeta = metas.find(
      (meta) => meta.metaKey === META_KEYS.RANKMATH_FB_DESCRIPTION,
    );
    const ogDescription = ogDescriptionMeta?.metaValue ?? seoDescription;
    const ogImageMeta = metas.find(
      (meta) => meta.metaKey === META_KEYS.RANKMATH_FB_IMAGE,
    );
    const ogImage = ogImageMeta?.metaValue ?? '';

    // Twitter fields
    const twitterTitleMeta = metas.find(
      (meta) => meta.metaKey === META_KEYS.RANKMATH_TWITTER_TITLE,
    );
    const twitterTitle = twitterTitleMeta?.metaValue ?? ogTitle;
    const twitterDescriptionMeta = metas.find(
      (meta) => meta.metaKey === META_KEYS.RANKMATH_TWITTER_DESCRIPTION,
    );
    const twitterDescription =
      twitterDescriptionMeta?.metaValue ?? ogDescription;

    const twitterImageMeta = metas.find(
      (meta) => meta.metaKey === META_KEYS.RANKMATH_TWITTER_IMAGE,
    );
    const twitterImage = twitterImageMeta?.metaValue ?? ogImage;

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
