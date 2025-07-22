/**
 * Mock data factories for LearnPostBuilderService tests
 */
import {
  AttachmentPost,
  TermRelationship,
  LearnMeta,
  PostMeta,
} from '../../../../domain/types/prisma-types';
import { META_KEYS } from '../../../consts/meta-keys.const';
import { TAXONOMIES } from '../../../consts/taxonomies';

/**
 * Factory function to create mock AttachmentPost objects
 */
export const createMockAttachmentPost = (
  id: number,
  guid: string,
  title: string,
  excerpt: string,
  metas: PostMeta[] = [],
): AttachmentPost => ({
  id: BigInt(id),
  guid,
  postTitle: title,
  postExcerpt: excerpt,
  metas,
  postAuthor: BigInt(1),
  postDate: new Date(),
  postDateGmt: new Date(),
  postContent: '',
  postContentFiltered: '',
  postStatus: '',
  postName: '',
  postModified: new Date(),
  postModifiedGmt: new Date(),
  postParent: BigInt(0),
  menuOrder: 0,
  postType: '',
  postMimeType: '',
  commentCount: BigInt(0),
  commentStatus: '',
  pingStatus: '',
  postPassword: '',
  toPing: '',
  pinged: '',
});

/**
 * Factory function to create mock PostMeta objects
 */
export const createMockPostMeta = (
  id: number,
  postId: number,
  key: string,
  value: string,
): PostMeta => ({
  metaId: BigInt(id),
  postId: BigInt(postId),
  metaKey: key,
  metaValue: value,
});

/**
 * Factory function to create mock TermRelationship objects
 */
export const createMockTermRelationship = (
  objectId: number,
  termTaxonomyId: number,
  termId: number,
  taxonomy: string,
  name: string,
  slug: string,
): TermRelationship => ({
  objectId: BigInt(objectId),
  termTaxonomyId: BigInt(termTaxonomyId),
  termOrder: 0,
  termTaxonomy: {
    termTaxonomyId: BigInt(termTaxonomyId),
    termId: BigInt(termId),
    taxonomy,
    description: '',
    parent: BigInt(0),
    count: BigInt(1),
    term: {
      termId: BigInt(termId),
      name,
      slug,
      termGroup: BigInt(0),
    },
  },
});

/**
 * Factory function to create mock LearnMeta objects
 */
export const createMockLearnMeta = (
  id: number,
  isSponsored: boolean = false,
  sponsorName: string | null = null,
  sponsorUrl: string | null = null,
  sponsorImageSidebarUrl: string | null = null,
  sponsorImageContentUrl: string | null = null,
  sponsorExtraData: string | null = null,
): LearnMeta => ({
  id,
  url: null,
  thumbnailId: null,
  authorId: null,
  authorName: null,
  images: null,
  isSponsored,
  sponsorName,
  sponsorUrl,
  sponsorImage: null,
  sponsorImageSidebarUrl,
  sponsorImageSidebar: null,
  sponsorImageContentUrl,
  sponsorImageContent: null,
  sponsorExtraData,
});

/**
 * Pre-configured mock data for common test scenarios
 */
export const mockAttachmentWithMetas = createMockAttachmentPost(
  123,
  'https://example.com/image.jpg',
  'Test Image',
  'Test image excerpt',
  [
    createMockPostMeta(1, 123, META_KEYS.IMAGE_ALT, 'Alt text for image'),
    createMockPostMeta(2, 123, META_KEYS.IMAGE_CAPTION, 'Caption for image'),
  ],
);

export const mockAttachmentWithoutMetas = createMockAttachmentPost(
  123,
  'https://example.com/image.jpg',
  'Test Image',
  'Test image excerpt',
  [],
);

export const mockCategoryTermRelationships: TermRelationship[] = [
  createMockTermRelationship(
    1,
    1,
    1,
    TAXONOMIES.CATEGORY,
    'Technology',
    'technology',
  ),
  createMockTermRelationship(
    1,
    2,
    2,
    TAXONOMIES.CATEGORY,
    'Programming',
    'programming',
  ),
  createMockTermRelationship(1, 3, 3, 'post_tag', 'JavaScript', 'javascript'),
];

export const mockTagOnlyTermRelationships: TermRelationship[] = [
  createMockTermRelationship(1, 1, 1, 'post_tag', 'JavaScript', 'javascript'),
];

export const mockLocationMetas: PostMeta[] = [
  createMockPostMeta(1, 1, META_KEYS.LATITUDE, '14.6349'),
  createMockPostMeta(2, 1, META_KEYS.LONGITUDE, '-90.5069'),
];

export const mockEmptyLocationMetas: PostMeta[] = [
  createMockPostMeta(1, 1, META_KEYS.LATITUDE, ''),
  createMockPostMeta(2, 1, META_KEYS.LONGITUDE, ''),
];

export const mockCompleteSeoMetas: PostMeta[] = [
  createMockPostMeta(1, 1, META_KEYS.RANKMATH_TITLE, 'SEO Title'),
  createMockPostMeta(2, 1, META_KEYS.RANKMATH_DESCRIPTION, 'SEO Description'),
  createMockPostMeta(
    3,
    1,
    META_KEYS.RANKMATH_CANONICAL_URL,
    'https://example.com/canonical',
  ),
  createMockPostMeta(4, 1, META_KEYS.RANKMATH_FOCUS_KEYWORD, 'test keyword'),
  createMockPostMeta(5, 1, META_KEYS.RANKMATH_SEO_SCORE, '85'),
  createMockPostMeta(6, 1, META_KEYS.RANKMATH_FB_TITLE, 'OG Title'),
  createMockPostMeta(7, 1, META_KEYS.RANKMATH_FB_DESCRIPTION, 'OG Description'),
  createMockPostMeta(
    8,
    1,
    META_KEYS.RANKMATH_FB_IMAGE,
    'https://example.com/og-image.jpg',
  ),
  createMockPostMeta(9, 1, META_KEYS.RANKMATH_TWITTER_TITLE, 'Twitter Title'),
  createMockPostMeta(
    10,
    1,
    META_KEYS.RANKMATH_TWITTER_DESCRIPTION,
    'Twitter Description',
  ),
  createMockPostMeta(
    11,
    1,
    META_KEYS.RANKMATH_TWITTER_IMAGE,
    'https://example.com/twitter-image.jpg',
  ),
];

export const mockPartialSeoMetas: PostMeta[] = [
  createMockPostMeta(1, 1, META_KEYS.RANKMATH_TITLE, 'Custom SEO Title'),
  createMockPostMeta(2, 1, META_KEYS.RANKMATH_FB_TITLE, 'Custom OG Title'),
  createMockPostMeta(3, 1, META_KEYS.RANKMATH_SEO_SCORE, '75'),
];

export const mockInvalidSeoMetas: PostMeta[] = [
  createMockPostMeta(1, 1, META_KEYS.RANKMATH_SEO_SCORE, 'invalid'),
];

export const mockSponsoredLearnMeta = createMockLearnMeta(
  1,
  true,
  'Test Sponsor',
  'https://sponsor.com/image.jpg',
  'https://sponsor.com/sidebar.jpg',
  'https://sponsor.com/content.jpg',
  'Extra sponsor data',
);

export const mockPartialSponsorLearnMeta = createMockLearnMeta(
  1,
  true,
  'Test Sponsor',
  null,
  null,
  null,
  null,
);
