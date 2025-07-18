import { Prisma } from '@prisma/client';

export type PostMeta = Prisma.AprPostmetaGetPayload<object>;

export type LearnMeta = Prisma.AprLearnMetaGetPayload<object>;

export type TermRelationship = Prisma.AprTermRelationshipsGetPayload<{
  include: {
    termTaxonomy: {
      include: {
        term: true;
      };
    };
  };
}>;

export type CategoryWithTerm = Prisma.AprTermTaxonomyGetPayload<{
  include: {
    term: true;
  };
}>;

export type AttachmentPost = Prisma.AprPostsGetPayload<{
  include: {
    metas: true;
  };
}>;
