/**
 * Mock services for testing LearnRepository
 */

export const mockPrismaService = {
  aprTermTaxonomy: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  aprPosts: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  aprLearnMeta: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  aprPostmeta: {
    findMany: jest.fn(),
  },
  aprTermRelationships: {
    findMany: jest.fn(),
  },
};

export const mockLearnPostBuilderService = {
  buildHierarchy: jest.fn(),
  buildImages: jest.fn(),
  buildCategories: jest.fn(),
  buildAuthor: jest.fn(),
  buildSponsor: jest.fn(),
  buildLocationGeopoint: jest.fn(),
  buildSeo: jest.fn(),
};

export const mockConfigService = {
  get: jest.fn().mockReturnValue('https://test.example.com'),
};
