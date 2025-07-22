import {
  CategoryWithTerm,
  AttachmentPost,
  TermRelationship,
  LearnMeta,
  PostMeta,
} from '../../../../domain/types/prisma-types';

/**
 * Factory function to create mock CategoryWithTerm objects
 */
export const createMockCategoryWithTerm = (
  id: number,
  name: string,
  slug: string,
  description: string,
  parent: number,
  count: number,
): CategoryWithTerm => ({
  termTaxonomyId: BigInt(id),
  termId: BigInt(id),
  taxonomy: 'category',
  description,
  parent: BigInt(parent),
  count: BigInt(count),
  term: {
    termId: BigInt(id),
    name,
    slug,
    termGroup: BigInt(0),
  },
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
  taxonomy: string,
  termId: number,
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
 * Factory function to create mock Post objects with all required fields
 */
export const createMockPost = (
  id: number,
  title: string,
  slug: string,
  excerpt: string,
  content: string,
  metas: PostMeta[] = [],
  termRelationships: TermRelationship[] = [],
) => ({
  id: BigInt(id),
  postAuthor: BigInt(1),
  postDate: new Date('2025-07-22'),
  postDateGmt: new Date('2025-07-22'),
  postContent: content,
  postTitle: title,
  postExcerpt: excerpt,
  postStatus: 'publish',
  commentStatus: 'open',
  pingStatus: 'closed',
  postPassword: '',
  postName: slug,
  toPing: '',
  pinged: '',
  postModified: new Date('2025-07-22'),
  postModifiedGmt: new Date('2025-07-22'),
  postContentFiltered: '',
  postParent: BigInt(0),
  guid: `https://example.com/${slug}`,
  menuOrder: 0,
  postType: 'post',
  postMimeType: '',
  commentCount: BigInt(0),
  metas,
  termRelationships,
});

/**
 * Factory function to create mock LearnMeta objects
 */
export const createMockLearnMeta = (
  id: number,
  isSponsored: boolean = false,
  sponsorName: string | null = null,
  sponsorUrl: string | null = null,
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
  sponsorImageSidebarUrl: null,
  sponsorImageSidebar: null,
  sponsorImageContentUrl: null,
  sponsorImageContent: null,
  sponsorExtraData: null,
});

/**
 * Factory function to create mock AttachmentPost objects
 */
export const createMockAttachment = (
  id: number,
  guid: string,
  title: string,
  excerpt: string,
  metas: PostMeta[] = [],
): AttachmentPost => ({
  id: BigInt(id),
  postAuthor: BigInt(1),
  postDate: new Date('2025-07-22'),
  postDateGmt: new Date('2025-07-22'),
  postContent: '',
  postTitle: title,
  postExcerpt: excerpt,
  postStatus: 'inherit',
  commentStatus: 'closed',
  pingStatus: 'closed',
  postPassword: '',
  postName: `attachment-${id}`,
  toPing: '',
  pinged: '',
  postModified: new Date('2025-07-22'),
  postModifiedGmt: new Date('2025-07-22'),
  postContentFiltered: '',
  postParent: BigInt(0),
  guid,
  menuOrder: 0,
  postType: 'attachment',
  postMimeType: 'image/jpeg',
  commentCount: BigInt(0),
  metas,
});
